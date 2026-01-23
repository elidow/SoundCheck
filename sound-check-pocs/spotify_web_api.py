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

    def save_songs(self, track_ids):
        """
        Save a list of songs to the user's library.
        
        Args:
            track_ids: List of Spotify track IDs to save
            
        Returns:
            Dictionary with 'saved' (list of saved track IDs), 'already_saved' (list of already-saved track IDs), and 'failed' (list of failed track IDs)
        """
        if not track_ids:
            return {"saved": [], "already_saved": [], "failed": []}
        
        url = "https://api.spotify.com/v1/me/tracks"
        headers = self._get_headers()
        
        result = {"saved": [], "already_saved": [], "failed": []}
        
        # Process in batches of 50 (Spotify API limit)
        batch_size = 50
        for i in range(0, len(track_ids), batch_size):
            batch = track_ids[i:i+batch_size]
            batch_num = i//batch_size + 1
            
            try:
                # Check which songs are already saved
                print(f"  Batch {batch_num}: Checking if {len(batch)} songs are already saved...")
                check_response = requests.get(url, headers=headers, params={"ids": ",".join(batch)})
                if check_response.status_code != 200:
                    raise Exception(f"Failed to check saved songs: {check_response.status_code}, {check_response.text}")
                
                response_data = check_response.json()
                print(f"  Batch {batch_num}: Got response type: {type(response_data).__name__}")
                if isinstance(response_data, dict):
                    print(f"  Batch {batch_num}: Response keys: {list(response_data.keys())}")
                
                # The response can be either a list or a dict with 'contains' field
                if isinstance(response_data, dict) and "contains" in response_data:
                    already_saved_flags = response_data["contains"]
                elif isinstance(response_data, list):
                    already_saved_flags = response_data
                else:
                    # If it's a dict without 'contains', try to use its values
                    print(f"  Batch {batch_num}: Unexpected response format: {type(response_data).__name__}")
                    print(f"  Batch {batch_num}: Full response: {response_data}")
                    raise Exception(f"Unexpected response format: {type(response_data)}")
                
                print(f"  Batch {batch_num}: Got {len(already_saved_flags)} saved flags")
                
                # Separate tracks that are already saved from those that aren't
                tracks_to_save = []
                for j, track_id in enumerate(batch):
                    if j < len(already_saved_flags) and already_saved_flags[j]:
                        result["already_saved"].append(track_id)
                    else:
                        tracks_to_save.append(track_id)
                
                # Save tracks that aren't already saved
                if tracks_to_save:
                    print(f"  Batch {batch_num}: Saving {len(tracks_to_save)} new songs...")
                    save_response = requests.put(
                        url,
                        headers=headers,
                        json={"ids": tracks_to_save}
                    )
                    if save_response.status_code == 200:
                        result["saved"].extend(tracks_to_save)
                        print(f"  Batch {batch_num}: Successfully saved {len(tracks_to_save)} songs")
                    else:
                        result["failed"].extend(tracks_to_save)
                        print(f"  Batch {batch_num}: Failed to save - {save_response.status_code}, {save_response.text}")
                else:
                    print(f"  Batch {batch_num}: All {len(batch)} songs were already saved")
            except Exception as e:
                result["failed"].extend(batch)
                print(f"  Batch {batch_num}: Exception - {type(e).__name__}: {str(e)}")
                import traceback
                traceback.print_exc()
        
        return result

    def unsave_songs(self, track_ids):
        """
        Remove a list of songs from the user's library.
        
        Args:
            track_ids: List of Spotify track IDs to unsave
            
        Returns:
            Dictionary with 'unsaved' (list of unsaved track IDs), 'not_saved' (list of track IDs that weren't saved), and 'failed' (list of failed track IDs)
        """
        if not track_ids:
            return {"unsaved": [], "not_saved": [], "failed": []}
        
        url = "https://api.spotify.com/v1/me/tracks"
        headers = self._get_headers()
        
        result = {"unsaved": [], "not_saved": [], "failed": []}
        
        # Process in batches of 50 (Spotify API limit)
        batch_size = 50
        for i in range(0, len(track_ids), batch_size):
            batch = track_ids[i:i+batch_size]
            batch_num = i//batch_size + 1
            
            try:
                # Check which songs are saved
                print(f"  Batch {batch_num}: Checking if {len(batch)} songs are saved...")
                check_response = requests.get(url, headers=headers, params={"ids": ",".join(batch)})
                if check_response.status_code != 200:
                    raise Exception(f"Failed to check saved songs: {check_response.status_code}, {check_response.text}")
                
                response_data = check_response.json()
                print(f"  Batch {batch_num}: Got response type: {type(response_data).__name__}")
                if isinstance(response_data, dict):
                    print(f"  Batch {batch_num}: Response keys: {list(response_data.keys())}")
                
                # The response can be either a list or a dict with 'contains' field
                if isinstance(response_data, dict) and "contains" in response_data:
                    saved_flags = response_data["contains"]
                elif isinstance(response_data, list):
                    saved_flags = response_data
                else:
                    # If it's a dict without 'contains', try to use its values
                    print(f"  Batch {batch_num}: Unexpected response format: {type(response_data).__name__}")
                    print(f"  Batch {batch_num}: Full response: {response_data}")
                    raise Exception(f"Unexpected response format: {type(response_data)}")
                
                print(f"  Batch {batch_num}: Got {len(saved_flags)} saved flags")
                
                # Separate tracks that are saved from those that aren't
                tracks_to_unsave = []
                for j, track_id in enumerate(batch):
                    if j < len(saved_flags) and saved_flags[j]:
                        tracks_to_unsave.append(track_id)
                    else:
                        result["not_saved"].append(track_id)
                
                # Unsave tracks that are saved
                if tracks_to_unsave:
                    print(f"  Batch {batch_num}: Unsaving {len(tracks_to_unsave)} songs...")
                    unsave_response = requests.delete(
                        url,
                        headers=headers,
                        json={"ids": tracks_to_unsave}
                    )
                    if unsave_response.status_code == 200:
                        result["unsaved"].extend(tracks_to_unsave)
                        print(f"  Batch {batch_num}: Successfully unsaved {len(tracks_to_unsave)} songs")
                    else:
                        result["failed"].extend(tracks_to_unsave)
                        print(f"  Batch {batch_num}: Failed to unsave - {unsave_response.status_code}, {unsave_response.text}")
                else:
                    print(f"  Batch {batch_num}: All {len(batch)} songs were not saved")
            except Exception as e:
                result["failed"].extend(batch)
                print(f"  Batch {batch_num}: Exception - {type(e).__name__}: {str(e)}")
                import traceback
                traceback.print_exc()
        
        return result
