from typing import Optional

from sqlalchemy.orm import Session

from fastapi import FastAPI, Header, Depends, HTTPException
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import spotipy_driver as spdrv

from database import SessionLocal, engine
from models import Base
from crud import *
from schemas import *

Base.metadata.create_all(bind=engine)

import requests
import os
import base64

app = FastAPI()

if os.getenv('FASTAPI_ENV') == 'prod':
    origins = [
        'https://publify.aldon.info',
        'https://auth.publify.aldon.info',
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    REDIRECT  = 'https://auth.publify.aldon.info/api/auth/authorized'
    ROOT_FQDN = 'https://publify.aldon.info'
else:
    origins = [
        'http://localhost',
        'http://localhost:8080',
    ]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=['*'],
        allow_headers=['*'],
    )
    REDIRECT  = 'https://xxx.localhost/api/auth/authorized'
    ROOT_FQDN = 'http://localhost:8080'

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
SCOPES    = '+'.join((
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-collaborative',
))


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
def read_radio(radio_info: RadioInformation, authorization: Optional[str] = Header(None)):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail="No profile found")
    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)
    
    watched_playlist = spdrv.Playlist(radio_info.playlist_id, usr)
    usr.getPlaylists()
    artists = watched_playlist.getArtistsIdInPlaylist(usr.id, radio_info.playlist_id)
    albums_id = watched_playlist.getArtistsAlbums(artists)
    dates = watched_playlist.getAlbumsReleaseDate(albums_id)
    tracks = watched_playlist.getLastAlbums(7, dates)
    if tracks == []:
        print("no new songs")
        return HTTPException(status_code=404, detail="No songs found")
    watched_playlist.createReleasePlaylist(usr.id, radio_info.playlist_name, tracks)
    return {'data': radio_info}


@app.get('/playlist')
def read_playlists(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    print(authorization)
    user_name = user.get('display_name', None)
    user_id = user.get('id', None)
    if user_name is None or user_id is None:
        raise HTTPException(status_code=403, detail="Not connected")
    authorization_code = authorization.split(' ')[1]

    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)
    usr.getPlaylists()

    db_user = get_user_by_spotify_id(db, user_id)
    user_syncs = get_sync_by_owner(db, db_user.id)
    result = {
        'public': [{
            'name': a.name,
            'id' : a.id
        } for a in usr.playlists['public']],
        'collaborative': [{
                'name': b.name, 
                'id': b.id
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
def create_playlist_sync(sync: SyncInformation, db: Session = Depends(get_db), authorization: Optional[str] = Header(None)):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    if user_id is None:
        raise HTTPException(status_code=400, detail="User does not exist")
    db_user = get_user_by_spotify_id(db=db, spotify_id=user_id)
    # db_sync = get_sync_by_content(db, db_user.id, sync.collaborative, sync.public)
    # if db_sync:
    #     raise HTTPException(status_code=400, detail="Sync Already exists")
    return create_user_sync(db=db, item=sync, user_id=db_user.id)


@app.get('/playlist/{sync_id}')
def read_playlist_info(sync_id: int, db: Session = Depends(get_db)):
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail="Sync id does not exist")
    return {'id': sync_id, 'collaborative': p.collaborative, 'public': p.public}

@app.put('/playlist/{sync_id}')
def update_playlist(sync_id: int, sync: SyncInformation, db: Session = Depends(get_db)):
    existing_sync = get_sync_by_id(db, sync_id)
    if existing_sync is None:
        raise HTTPException(status_code=400, detail="Sync id does not exist")
    existing_sync.collaborative = sync.collaborative
    existing_sync.public = sync.public
    return {'id': sync_id}

@app.delete('/playlist/{sync_id}')
def delete_playlist_sync(sync_id: int, db: Session = Depends(get_db)):
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail="Sync id does not exist")
    delete_sync(db, sync_id)
    return {'id': sync_id}


def Diff(l1, l2):
    return (list(list(set(l1) - set(l2)) + list(set(l2) - set(l1))))

@app.get('/playlist/{sync_id}/sync')
def read_sync_status(sync_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db), mode: Optional[str] = 'forward'):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail="No profile found")
    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail="Sync id does not exist")
    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)

    public = spdrv.Playlist(p.public, usr, type="public")
    public.getTracks()
    collaborative = spdrv.Playlist(p.collaborative, usr, type="collaborative")
    collaborative.getTracks()
    print(public.id)
    print(collaborative.tracks)
    if mode == "forward":
        trackDiff = Diff(collaborative.getTracksNames(), public.getTracksNames())
    elif mode == "backward":
        trackDiff = Diff(public.getTracksNames(), collaborative.getTracksNames())
    return {'id': sync_id, 'collaborative_tracks': collaborative.getTracksNames(), 'public_tracks': public.getTracksNames(), 'diff': trackDiff}

@app.put('/playlist/{sync_id}/sync')
def sync_playlist(sync_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db), mode: Optional[str] = 'forward'):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=400, detail="No profile found")

    p = get_sync_by_id(db, sync_id)
    if p is None:
        raise HTTPException(status_code=400, detail="Sync id does not exist")

    authorization_code = authorization.split(' ')[1]
    usr = spdrv.User(token=authorization_code, id=user_id, name=user_name)

    public = spdrv.Playlist(p.public, usr, type="public")
    public.getTracks()
    collaborative = spdrv.Playlist(p.collaborative, usr, type="collaborative")
    collaborative.getTracks()
    print(public.id)
    print(collaborative.id)
    if mode == "forward":
        public.sync(collaborative)
    elif mode == "backward":
        collaborative.sync(public)     
    return {'id': sync_id}

@app.get('/api/auth/login')
def spotify_api_login():
    return RedirectResponse(f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope={SCOPES}&redirect_uri={REDIRECT}')

@app.get('/api/auth/authorized')
def spotify_api_autorized(code: Optional[str] = None, db: Session = Depends(get_db)):
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
    me = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': 'Bearer ' + token})
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
def read_user(authorization: Optional[str] = Header(None)):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    user = r.json()
    user_id = user.get('id', None)
    user_name = user.get('display_name', None)
    print(user)
    if user_id is None or user_name is None:
        raise HTTPException(status_code=403, detail="No profile found, authorization token no more valid.")
    return {'username': user_name, 'id': user_id}
