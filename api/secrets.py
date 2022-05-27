import os

if os.getenv('FASTAPI_ENV') == 'prod':
    SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://user:password@postgres/publify"
    origins = [
        'https://publify.aldon.info',
    ]
    REDIRECT  = 'https://auth.publify.aldon.info/api/auth/authorized'
    ROOT_FQDN = 'https://publify.aldon.info'
elif os.getenv('FASTAPI_ENV') == 'env':
    REDIRECT = os.getenv('REDIRECT_URL')
    ROOT_FQDN = os.getenv('ROOT_FQDN')
    origins = [os.getenv('ORIGIN')]
    SQLALCHEMY_DATABASE_URL = os.getenv('SQLALCHEMY_DATABASE_URL')
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
    origins = [
        'http://localhost',
        'http://localhost:8080',
        'http://localhost:8000',
    ]
    REDIRECT  = 'https://xxx.localhost/api/auth/authorized'
    ROOT_FQDN = 'http://localhost:8080'

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

SCOPES    = '+'.join((
'playlist-read-private',
'playlist-modify-private',
'playlist-modify-public',
'playlist-read-collaborative',
))
