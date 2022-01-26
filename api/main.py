from typing import Optional, List

from sqlalchemy.orm import Session

from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import spotipy_driver as spdrv

from database import SessionLocal, engine
from models import Base
from crud import *
from schemas import *
from secrets import origins, REDIRECT, ROOT_FQDN, CLIENT_ID, CLIENT_SECRET, SCOPES

Base.metadata.create_all(bind=engine)

import requests
import json
import os
import base64

app = FastAPI()

SPOTIFY_API_ME = "https://api.spotify.com/v1/me"

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class SyncInformation(BaseModel):
    collaborative_name: str
    collaborative: str
    public_name: str
    public: str

class RadioInformation(BaseModel):
    playlist_id: str
    playlist_name: str

def getPlaylistIdfromName(playlist, usr_playlists):
	for a in usr_playlists[0]:
		if (a[0] == playlist):	
			return(a[1])
	return None

@app.post('/radio')
async def read_radio(radio_info: RadioInformation, authorization: Optional[str] = Header(None)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail='No profile found')
    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)
    if not radio_info or not radio_info.playlist_id or not radio_info.playlist_name:
        raise HTTPException(status_code=400, detail='No playlist selected')
    watched_playlist = spdrv.Playlist(radio_info.playlist_id, usr)
    usr.getPlaylists()
    artists = watched_playlist.getArtistsIdInPlaylist(usr.id, radio_info.playlist_id)
    albums_id = watched_playlist.getArtistsAlbums(artists)
    dates = watched_playlist.getAlbumsReleaseDate(albums_id)
    tracks = watched_playlist.getLastAlbums(7, dates)
    if tracks == []:
        print('no new songs')
        return HTTPException(status_code=404, detail='No songs found')
    created_name = watched_playlist.createReleasePlaylist(usr.id, radio_info.playlist_name, tracks)
    return {'data': {'playlist_name': created_name, 'tracks_number': len(tracks), 'date': 7}}

@app.get('/playlist-info/{spot_playlist_id}')
async def playlist_info(spot_playlist_id: str, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    if user_id is None:
        raise HTTPException(status_code=400, detail='User does not exist')
    req = requests.get('https://api.spotify.com/v1/playlists/' + spot_playlist_id, headers={'Authorization': authorization})
    info = req.json()
    return {"name": info['name'], 'id': info['id'], 'owner': info['owner']}

@app.get('/playlist')
async def read_playlists(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    print(authorization)
    user_name = user.get('display_name', None)
    user_id = user.get('id', None)
    if user_name is None or user_id is None:
        raise HTTPException(status_code=403, detail='Not connected')
    authorization_code = authorization.split(' ')[1]

    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)
    usr.getPlaylists()

    db_user = get_user_by_spotify_id(db, user_id)
    user_syncs = get_sync_by_owner(db, db_user.id)
    result = {
        'public': [{
            'name': a.name,
            'id' : a.id,
            'imgurl': a.image_url
        } for a in usr.playlists['public']],
        'collaborative': [{
                'name': b.name, 
                'id': b.id,
                'imgurl': b.image_url

        } for b in usr.playlists['collaborative']],
        'watched': [{
                'name': b.name, 
                'id': b.id
        } for b in usr.playlists['watched']],
        'links': [
            {
                'collaborative': {
                    'name': c.collaborative_name, 
                    'id': c.collaborative
            },  'public': {
                    'name': c.public_name,
                    'id': c.public
            },
            'id': c.id} for c in user_syncs]
    }
    return {'result': result}

@app.post('/playlist')
async def create_playlist_sync(sync: SyncInformation, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    if user_id is None:
        raise HTTPException(status_code=400, detail='User does not exist')
    db_user = get_user_by_spotify_id(db=db, spotify_id=user_id)
    # db_sync = get_sync_by_content(db, db_user.id, sync.collaborative, sync.public)
    # if db_sync:
    #     raise HTTPException(status_code=400, detail='Sync Already exists')
    return create_user_sync(db=db, item=sync, user_id=db_user.id)


@app.get('/playlist/{sync_id}')
async def read_playlist_info(sync_id: int, db: Session = Depends(get_db)):
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail='Sync id does not exist')
    return {'id': sync_id, 'collaborative': p.collaborative, 'public': p.public}

@app.put('/playlist/{sync_id}')
async def update_playlist(sync_id: int, sync: SyncInformation, db: Session = Depends(get_db)):
    existing_sync = get_sync_by_id(db, sync_id)
    if existing_sync is None:
        raise HTTPException(status_code=400, detail='Sync id does not exist')
    existing_sync.collaborative = sync.collaborative
    existing_sync.public = sync.public
    return {'id': sync_id}

@app.delete('/playlist/{sync_id}')
async def delete_playlist_sync(sync_id: int, db: Session = Depends(get_db)):
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail='Sync id does not exist')
    delete_sync(db, sync_id)
    return {'id': sync_id}


def Diff(l1, l2):
    return (list(list(set(l1) - set(l2)) + list(set(l2) - set(l1))))

@app.get('/playlist/{sync_id}/sync')
async def read_sync_status(sync_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db), mode: Optional[str] = 'forward'):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail='No profile found')
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail='Sync id does not exist')
    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)

    public = spdrv.Playlist(p.public, usr, type='public')
    public.getTracks()
    collaborative = spdrv.Playlist(p.collaborative, usr, type='collaborative')
    collaborative.getTracks()
    if mode == 'forward':
        trackDiff = Diff(collaborative.getTracksNames(), public.getTracksNames())
    elif mode == 'backward':
        trackDiff = Diff(public.getTracksNames(), collaborative.getTracksNames())
    return {'id': sync_id, 'collaborative_tracks': collaborative.getTracksNames(), 'public_tracks': public.getTracksNames(), 'diff': trackDiff}

@app.put('/playlist/{sync_id}/sync')
async def sync_playlist(sync_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db), mode: Optional[str] = 'forward'):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail='No profile found')

    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail='Sync id does not exist')

    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)

    public = spdrv.Playlist(p.public, usr, type='public')
    public.getTracks()
    collaborative = spdrv.Playlist(p.collaborative, usr, type='collaborative')
    collaborative.getTracks()
    if mode == 'forward':
        public.sync(collaborative)
    elif mode == 'backward':
        collaborative.sync(public)     
    return {'id': sync_id}

@app.get('/api/auth/login')
async def spotify_api_login():
    return RedirectResponse(f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope={SCOPES}&redirect_uri={REDIRECT}')

@app.get('/api/auth/authorized')
async def spotify_api_autorized(code: Optional[str] = None, db: Session = Depends(get_db)):
    payload = {
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': f'{REDIRECT}'
    }
    secret_string = CLIENT_ID + ':' + CLIENT_SECRET
    header = {
        'Authorization': b'Basic ' + base64.b64encode(secret_string.encode('utf-8')),
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    r = requests.post('https://accounts.spotify.com/api/token', data=payload, headers=header)
    res = r.json()
    token = res.get('access_token', None)
    if token is None:
        return RedirectResponse(f'{ROOT_FQDN}?token=None')
    me = requests.get(SPOTIFY_API_ME, headers={'Authorization': 'Bearer ' + token})
    res = me.json()
    db_user = get_user_by_spotify_id(db, spotify_id=res['id'])
    if db_user:
        result = r.json()
        token = result['access_token']
        return RedirectResponse(f'{ROOT_FQDN}?token={token}')
    create_user(db=db, spotify_id=res['id'])
    result = r.json()
    token = result['access_token']
    return RedirectResponse(f'{ROOT_FQDN}?token={token}')


@app.get('/api/auth/user')
async def read_user(authorization: Optional[str] = Header(None)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=403, detail='No profile found, authorization token no more valid.')
    return {'username': user_name, 'id': user_id}

"""
tracks_info: list of dicts of all tracks informations
authorization: token
"""
def get_contributors(tracks_info, authorization):
    contributors_id = list(set([elem['added_by']['id'] for elem in tracks_info]))
    contributors = {elem: requests.get(f'https://api.spotify.com/v1/users/{elem}', headers={'Authorization': authorization}).json()['display_name'] for elem in contributors_id}
    return contributors

def getAllTracks(playlist_id, authorization):
    tracks = []
    i = 0
    c = True
    while c:
        response = requests.get(f'https://api.spotify.com/v1/playlists/{playlist_id}/tracks', params={
            'fields': 'next, items(added_at, added_by, id, track(album(artists), name, id, href, duration))',
            'limit': 50,
            'offset': i,
        }, headers={'Content-Type':'application/json', 'Authorization': authorization})
        tracks.append(response.json())
        if response.json()['next'] == None:
            c = False
        i+= 50
    result = []
    for a in tracks:
        result += a['items']
    return result

def get_user_profile(usr, authorization):
    try:
        req = requests.get(f'https://api.spotify.com/v1/users/{usr}', 
            headers={'Authorization': authorization})
    except:
        return None
    return req.json()

@app.get('/users/{playlist_id}')
async def get_user_info(playlist_id: str, authorization: Optional[str] = Header(None)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail='No profile found')
    tracks_info = getAllTracks(playlist_id, authorization)
    contributors = get_contributors(tracks_info, authorization)
    result = []
    for usr in contributors:
        result.append(get_user_profile(usr, authorization))
    return result

@app.get('/playlist/{playlist_id}/graph')
async def create_playlist_graph(playlist_id:str, authorization: Optional[str] = Header(None)):
    r = requests.get(SPOTIFY_API_ME, headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail='No profile found')
    tracks_info = getAllTracks(playlist_id, authorization)
    contributors = get_contributors(tracks_info, authorization)
    dates = list(set([elem['added_at'][:7] for elem in tracks_info]))

    track_list = [{
        'added_at': elem['added_at'][:7],
        'added_by': contributors[elem['added_by']['id']],
        'tracks': [{
            'id': elem['track']['id'],
            'name': elem['track']['name']
        }],
    } for elem in tracks_info]
    for index, d in enumerate(track_list):
        index_delete = []
        for i in range(index + 1, len(track_list)):
            if track_list[i]['added_at'][:7] == d['added_at'][:7] and track_list[i]['added_by'] == d['added_by']:
                index_delete.append(i)
                d.update({'tracks': d['tracks'] + track_list[i]['tracks']})
        index_delete.reverse()
        for t in index_delete:
            track_list.pop(t)
    return {'data':  sorted(track_list, key=lambda x: x['added_at']), 'dates': {'max': max(dates), 'min':min(dates)}}
