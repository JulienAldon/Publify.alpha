# Publify.alpha API
## Local development
```
export SPOTIFY_CLIENT_ID=<your-spotify-client-id>
export SPOTIFY_CLIENT_ID=<your-spotify-secret-id>

pipenv run uvicorn main:app --reload
```

## API
| rule  |      route          |   description                           |
--------|---------------------|-----------------------------------------| 
|GET    | /playlist           | # Return a playlist list                |
|POST   | /playlist           | # Create a new playlist synchronization |
|GET    | /playlist/`<id>`      | # Return a playlist's information       |
|PUT    | /playlist/`<id>`      | # Update a playlist link                    |
|DELETE | /playlist/`<id>`      | # Remove a synchronization link         |
|GET    | /playlist/`<id>`/sync | # Get synchronization status for playlist|
|PUT    | /playlist/`<id>`/sync | # Request synchronization of a playlist |


# Publify.alpha Front
## Local development
``` npm run dev
```

# Publify.alpha Db

# Publify.alpha Nginx


# Deploy
```docker-compose up --buid -d
```