# Spotils_back
## Environment variables
Multiples environment variables are required for this application to run.
### Secret Environment variables
- **SPOTIFY_CLIENT_ID** : Client ID delivered by Spotify developper dashboard.
- **SPOTIFY_CLIENT_SECRET** : Client SECRET delivered by Spotify developper dashboard.
- **DATABASE_URL** : Connection string for sqlalchemy.

### Public Environment variables
- **CALLBACK_URL** : URL Spotify redirects to after authentification.
- **REDIRECT_URL** : URL we redirect to after receiving a token.
- **CORS_ORIGIN** : Allowed origin for Cross Origin Resource Sharing.
- **APP_ENV** : Environment to choose before starting server.

## Local development
```sh
export APP_ENV=""
export SPOTIFY_CLIENT_ID=<your-spotify-client-id>
export SPOTIFY_CLIENT_SECRET=<your-spotify-secret-id>

pipenv run uvicorn main:app --reload
```

## API Description
| rule  |      route            |   description                             |
--------|-----------------------|-------------------------------------------| 
|GET    | /playlist             | # Return a playlist list                  |
|GET    | /playlist/`<id>`      | # Return a playlist's link information    |
|GET    | /playlist/`<id>`/sync | # Get synchronization status for playlist |
|PUT    | /playlist/`<id>`      | # Update a playlist link                  |
|PUT    | /playlist/`<id>`/sync | # Request synchronization of a playlist   |
|POST   | /playlist             | # Create a new playlist synchronization   |
|DELETE | /playlist/`<id>`      | # Remove a synchronization link           |

# Spotils_front
## Environment variables
- **SERVICE_URL** : Url of the spotils_back service.
- **COOKIE_DOMAIN** : Fully qualified domain name of the spotils_front app.

## Local development
```sh
npm run dev
```
