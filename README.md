# Publify.alpha API
## Local development
```
export SPOTIFY_CLIENT_ID=<your-spotify-client-id>
export SPOTIFY_CLIENT_ID=<your-spotify-secret-id>

pipenv run uvicorn main:app --reload
```

## API
| rule  |      route            |   description                             |
--------|-----------------------|-------------------------------------------| 
|GET    | /playlist             | # Return a playlist list                  |
|GET    | /playlist/`<id>`      | # Return a playlist's link information    |
|GET    | /playlist/`<id>`/sync | # Get synchronization status for playlist |
|PUT    | /playlist/`<id>`      | # Update a playlist link                  |
|PUT    | /playlist/`<id>`/sync | # Request synchronization of a playlist   |
|POST   | /playlist             | # Create a new playlist synchronization   |
|DELETE | /playlist/`<id>`      | # Remove a synchronization link           |


# Publify.alpha Front
## Local development
```
npm run dev
```

# Publify.alpha Db

# Publify.alpha Nginx


# Deploy
```
docker-compose up --buid -d
```