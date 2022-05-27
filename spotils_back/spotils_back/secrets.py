import os

if os.getenv('APP_ENV') == 'prod':
    SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://user:password@postgres/publify"
    origins = [
        'https://publify.aldon.info',
    ]
    CALLBACK_URL  = 'https://auth.publify.aldon.info/api/auth/authorized'
    REDIRECT_URL = 'https://publify.aldon.info'
elif os.getenv('APP_ENV') == 'env':
    CALLBACK_URL = os.getenv('CALLBACK_URL')
    REDIRECT_URL = os.getenv('REDIRECT_URL')
    origins = [os.getenv('CORS_ORIGIN')]
    SQLALCHEMY_DATABASE_URL = os.getenv('DATABASE_URL')
else:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"
    origins = [
        'http://localhost',
        'http://localhost:8080',
        'http://localhost:8000',
    ]
    CALLBACK_URL  = 'https://xxx.localhost/api/auth/authorized'
    REDIRECT_URL = 'http://localhost:8080'

CLIENT_ID = os.getenv('SPOTIFY_CLIENT_ID')
CLIENT_SECRET = os.getenv('SPOTIFY_CLIENT_SECRET')

SCOPES    = '+'.join((
'playlist-read-private',
'playlist-modify-private',
'playlist-modify-public',
'playlist-read-collaborative',
))
