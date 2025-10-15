import os
import requests
import urllib.parse
import base64
import hashlib
import secrets
from dotenv import load_dotenv

class SpotifyWebApi:
    def __init__(self, client_id=None, redirect_uri=None, scope=None):
        load_dotenv()
        self.client_id = client_id or os.getenv("CLIENT_ID")
        self.redirect_uri = redirect_uri or os.getenv("REDIRECT_URI")
        self.scope = scope
        self.access_token = None
        self.refresh_token = None

    @staticmethod
    def generate_code_verifier():
        return base64.urlsafe_b64encode(secrets.token_bytes(64)).rstrip(b'=').decode('utf-8')

    @staticmethod
    def generate_code_challenge(verifier):
        sha256 = hashlib.sha256(verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(sha256).rstrip(b'=').decode('utf-8')

    def get_authorization_url(self, code_challenge):
        params = {
            "client_id": self.client_id,
            "response_type": "code",
            "redirect_uri": self.redirect_uri,
            "scope": self.scope,
            "code_challenge_method": "S256",
            "code_challenge": code_challenge
        }
        return "https://accounts.spotify.com/authorize?" + urllib.parse.urlencode(params)

    def get_token_pkce(self, authorization_code, code_verifier):
        url = "https://accounts.spotify.com/api/token"
        data = {
            "client_id": self.client_id,
            "grant_type": "authorization_code",
            "code": authorization_code,
            "redirect_uri": self.redirect_uri,
            "code_verifier": code_verifier
        }
        token_response = requests.post(url, data=data)
        if token_response.status_code != 200:
            raise Exception(f"Failed to get access token: {token_response.status_code}, {token_response.text}")
        tokens = token_response.json()
        self.access_token = tokens["access_token"]
        self.refresh_token = tokens.get("refresh_token")
        return tokens

    def _get_headers(self):
        if not self.access_token:
            raise Exception("Access token not set. Authenticate first.")
        return {"Authorization": f"Bearer {self.access_token}"}

    def get_playlists(self):
        playlists = []
        url = "https://api.spotify.com/v1/me/playlists"
        params = {"limit": 50, "offset": 0}
        while url:
            response = requests.get(url, headers=self._get_headers(), params=params)
            if response.status_code != 200:
                raise Exception(f"Failed to get playlists: {response.status_code}, {response.text}")
            data = response.json()
            items = data['items']
            # Only include playlists owned by 'eliasjohnsondow' and not named 'On Repeat 🎧'
            items = [pl for pl in items if pl['owner']['display_name'] == 'eliasjohnsondow' and pl['name'] != 'On Repeat 🎧']
            playlists.extend(items)
            url = data.get('next')
        return playlists

    def get_playlist(self, playlist_id):
        url = f"https://api.spotify.com/v1/playlists/{playlist_id}"
        response = requests.get(url, headers=self._get_headers())
        if response.status_code != 200:
            raise Exception(f"Failed to get playlist: {response.status_code}, {response.text}")
        playlist_data = response.json()
        # Handle pagination for tracks
        tracks = playlist_data["tracks"]
        all_items = tracks["items"][:]
        next_url = tracks.get("next")
        while next_url:
            track_response = requests.get(next_url, headers=self._get_headers())
            if track_response.status_code != 200:
                raise Exception(f"Failed to get playlist tracks: {track_response.status_code}, {track_response.text}")
            track_data = track_response.json()
            all_items.extend(track_data["items"])
            next_url = track_data.get("next")
        playlist_data["tracks"]["items"] = all_items
        return playlist_data

    def get_saved_songs(self):
        saved_songs = []
        url = "https://api.spotify.com/v1/me/tracks"
        params = {"market": "ES", "limit": 50, "offset": 0}
        while url:
            response = requests.get(url, headers=self._get_headers(), params=params)
            if response.status_code != 200:
                raise Exception(f"Failed to get saved songs: {response.status_code}, {response.text}")
            data = response.json()
            saved_songs.extend(data['items'])
            url = data.get('next')
        return saved_songs

    def get_top_songs(self, time_range="medium_term"):  # time_range: short_term, medium_term, long_term
        top_songs = []
        url = "https://api.spotify.com/v1/me/top/tracks"
        params = {"time_range": time_range, "limit": 50, "offset": 0}
        i = 0
        while url and i < 100:
            response = requests.get(url, headers=self._get_headers(), params=params)
            if response.status_code != 200:
                raise Exception(f"Failed to get top songs: {response.status_code}, {response.text}")
            data = response.json()
            top_songs.extend(data['items'])
            url = data.get('next')
            i += 1
        return top_songs
