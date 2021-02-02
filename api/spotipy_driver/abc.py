import abc
import spotipy
import spotipy.util as util

class User():
    """abc class representing a user
    """
    def __init__(self, token, id, name):
        self.id = id
        self.user = None
        self._client = spotipy.Spotify(auth=token)
        self.playlists = {'collaborative': [], 'public': []}
        self.name = name

    def getPlaylists(self):
        playlists = self._client.user_playlists(self.id)
        for playlist in playlists['items']:
            if playlist['owner']['id'] == self.id:
                if playlist['collaborative'] == True:
                    self.playlists['collaborative'].append(Playlist(playlist['id'], self, type="collaborative"))
                else:
                    self.playlists['public'].append(Playlist(playlist['id'], self, type="public"))


# class User(BaseUser):
 

        # return ()

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
    def __init__(self, _id, user, type="public"):
        self.user = user
        self.type = type
        self.id = _id
        self.tracks = None
        self.name = self.getName()


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
            self.user._client.user_playlist_add_tracks(self.user._client, self.id, add)
        if rem:
            self.user._client.user_playlist_remove_all_occurrences_of_tracks(self.user._client, self.id, rem)
    
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

    def getTracksNames(self):
        """return list of names of the tracks of the playlist
        """
        if not self.tracks:
            return []
        result = []
        for track in self.tracks:
            result.append(track.getName())
        return result