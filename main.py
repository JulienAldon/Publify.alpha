from typing import Optional

from fastapi import FastAPI, Header
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

import requests
import os
import base64

app = FastAPI()

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')
REDIRECT  = 'https://xxx.localhost/api/auth/authorized'
SCOPES    = '+'.join((
  'playlist-read-private',
  'playlist-modify-private',
  'playlist-modify-public',
  'playlist-read-collaborative',
))

class SyncInformation(BaseModel):
    collaborative: str
    public: str

@app.get('/')
def read_root():
    return {'Hello': 'World'}


@app.get('/playlist')
def read_playlists(authorization: Optional[str] = Header(None)):
    r = requests.get('https://api.spotify.com/v1/me', headers={'Authorization': authorization})
    return r.json()

@app.post('/playlist')
def create_playlist_sync(sync: SyncInformation):
    return {}


@app.get('/playlist/{playlist_id}')
def read_playlist_info(playlist_id: int):
    return {'id': playlist_id}

@app.put('/playlist/{playlist_id}')
def update_playlist(playlist_id: int):
    return {'id': playlist_id}

@app.delete('/playlist/{playlist_id}')
def delete_playlist_sync(playlist_id: int):
    return {'id': playlist_id}


@app.get('/playlist/{playlist_id}/sync')
def read_sync_status(playlist_id: int):
    return {'id': playlist_id}

@app.put('/playlist/{playlist_id}/sync')
def sync_playlist(playlist_id: int):
    return {'id': playlist_id}

@app.get('/api/auth/login')
def spotify_api_login():
    return RedirectResponse(f'https://accounts.spotify.com/authorize?response_type=code&client_id={CLIENT_ID}&scope={SCOPES}&redirect_uri={REDIRECT}')

@app.get('/api/auth/authorized')
def spotify_api_autorized(code: Optional[str] = None):
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
    print(header, payload)
    r = requests.post('https://accounts.spotify.com/api/token', data=payload, headers=header)
    
    return r.json()