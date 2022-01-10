import abc
import spotipy
import datetime

class User():
    """abc class representing a user
    """
    def __init__(self, token, id, name):
        self.id = id
        self.user = None
        self._client = spotipy.Spotify(auth=token)
        self.playlists = {'collaborative': [], 'public': [], 'watched': []}
        self.name = name

    def getPlaylists(self):
        playlists = self._client.user_playlists(self.id)
        for playlist in playlists['items']:
            if playlist['owner']['id'] == self.id:
                if playlist['collaborative'] == True:
                    self.playlists['collaborative'].append(Playlist(playlist['id'], self, url=playlist['images'], type="collaborative"))
                else:
                    self.playlists['public'].append(Playlist(playlist['id'], self, url=playlist['images'], type="public"))
            else:
                self.playlists['watched'].append(Playlist(playlist['id'], self, url=playlist['images'], type='watched'))

class Track():
    """abc class representing a track
    """
    def __init__(self, id, user, name):
        self.id = id
        self.user = user
        self.name = name

    def getName(self):
        track = self.user._client.track(self.id)
        return track['name']

    def getId(self):
        return self.id

class Playlist():
    """abc class representing a playlist
    """
    def __init__(self, _id, user, url="None", type="public"):
        self.user = user
        self.type = type
        self.id = _id
        self.tracks = None
        self.name = self.getName()
        self.image_url = url


    def getName(self):
        tracks = self.user._client.user_playlist(self.user.id, self.id)
        return tracks['name']

    def addTracks(self, _tracks):
        """
        tracks = [objectTrack]
        Add tracks from <_tracks> to the playlist.
        If the user (self.user) is not logged in, the function will not work.
        """
        add, rem = [], []
        self.user._client.trace = False
        tracksIds = [tr.id for tr in _tracks]
        ids = [tr.id for tr in self.tracks]
        for i in tracksIds:
            if not i in ids:
                add.append(i)
        for i in ids:
            if not i in tracksIds:
                rem.append(i)
        if add:
            while add:
                self.user._client.user_playlist_add_tracks(self.user._client, self.id, add[:100])
                add = add[100:]
        if rem:
            while rem:
                self.user._client.user_playlist_remove_all_occurrences_of_tracks(self.user._client, self.id, rem[:100])
                rem = rem[100:]
    
    def getTracks(self):
        """return a list of id for the tracks of the playlist
        """
        def getTrack(tracks):
            track_ids = []
            for item in tracks['items']:
                track_ids.append(item['track']['id'])
                track_ids.append(item['track']['name'])
            return track_ids
        
        result = self.user._client.user_playlist(self.user.id, self.id, fields="tracks,next")
        tracks = result['tracks']
        track_ids = getTrack(tracks)
        while tracks['next']:
            tracks = self.user._client.next(tracks)
            track_ids += getTrack(tracks)
        self.tracks = []
        it = iter(track_ids)
        for i in it:
            self.tracks.append(Track(i, self.user, next(it)))
        return self.tracks

    def sync(self, playlist):
        """
        playlist = PlaylistObject
        Synchronize playlist with the one given as parametter
        """
        self.addTracks(playlist.tracks)

    def show_artist(self, results):
        artists = []
        for item in results['items']:
            track = item['track']
            artists.append(track['artists'][0]['id'])
        return(artists)

    def getTracksNames(self):
        """return list of names of the tracks of the playlist
        """
        if not self.tracks:
            return []
        result = []
        for track in self.tracks:
            result.append(track.getName())
        return result
    
    def getArtistsAlbums(self, artists_id):
        """
        artists_id : list of artists_id
        """
        albums_id = []
        albums = []
        for a in artists_id:
            if a:
                albums.append(self.user._client.artist_albums(a, limit=5))
        for album in albums:
            for al in album['items']:
                albums_id.append(al)
        return(albums_id)

    def getAlbumsReleaseDate(self, albums_id):
        """
        albums_id : list of albums
        """
        dates = []
        for a in albums_id:
            dates.append((a['id'], a['release_date']))
        result = self.sortAlbumsByDate(dates) 
        return(result)

    def getLastAlbums(self, rg, albums_date):
        """
        rg: range of the time search (in days)
        albums_date format: [('%Y-%m-%d', 'album_id'), ...]
        """
        dates = self.generateRangeofDates(rg)
        res = [(a[0], a[1]) for a in albums_date if a[0] in dates]
        if res is None:
            print('No songs found!')
        l = []
        for a in res:
            album = self.user._client.album_tracks(a[1])
            l.append(album['items'][0]['id'])
        return(l)

    def generateRangeofDates(self, rg):
        """
        rg: range of the wanted generation
        """
        date = datetime.datetime.now()
        a = date.strftime('%Y-%m-%d')
        dt = datetime.datetime.strptime(a, "%Y-%m-%d")
        step = datetime.timedelta(days=1)
        l = []
        for i in range(0, rg):
            l.append(dt.strftime('%Y-%m-%d'))
            dt -= step
        return(l)

    def createReleasePlaylist(self, user_id, pl_name, tracks):
        a = self.generateRangeofDates(1)
        b = '[Releasify] ' + a[0] + ' ' + pl_name
        self.user._client.trace = False
        playlist = self.user._client.user_playlist_create(user_id, b, public=True)
        while tracks:
            results = self.user._client.user_playlist_add_tracks(user_id, playlist['id'], tracks[:100])
            tracks = tracks[100:]
        return b

    def sortAlbumsByDate(self, albums_date):
        """
        sort the albums_date list by date
        albums_date format: [('%Y-%m-%d', 'album_id'), ...]
        """
        fixed_dates = []
        for b in albums_date:
            if len(b[1]) == 4:
                fixed_dates.append((b[0], b[1] + '-01-01'))
            else:
                fixed_dates.append((b[0], b[1]))
        a = [(datetime.datetime.strptime(ts[1], "%Y-%m-%d"), ts[0]) for ts in fixed_dates]
        a.sort(key=lambda tup: tup[0])
        newa = [(datetime.datetime.strftime(ts[0], "%Y-%m-%d"), ts[1]) for ts in a]
        return(newa)

    def getArtistsIdInPlaylist(self, userid, playlistid):
        """
        get all the artists of a playlist
        """
        results = self.user._client.user_playlist(userid, playlistid, fields="tracks,next")
        artist = results['tracks']
        t = self.show_artist(artist)
        while artist['next']:
            artist = self.user._client.next(artist)
            t += self.show_artist(artist)
        t = list(set(t))
        return(t)