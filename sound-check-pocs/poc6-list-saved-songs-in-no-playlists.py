# Eli Dow
# September 2025
# SoundCheck POC - Saved Songs Not In Playlists

import os
import time
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")
scope = "playlist-read-private playlist-read-collaborative user-library-read"

# main function
def main():
    start_time = time.time()
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    print("Fetching playlists...")
    playlists = api.get_playlists()
    print(f"Found {len(playlists)} playlists.")

    playlist_song_ids = set()
    playlist_song_name_artist = set()
    print("Fetching songs from playlists...")
    for playlist in playlists:
        playlist_id = playlist["id"]
        playlist_data = api.get_playlist(playlist_id)
        for item in playlist_data["tracks"]["items"]:
            track = item.get("track")
            if not track:
                continue
            if track.get("id"):
                playlist_song_ids.add(track["id"])
            # Always add (name, artist) combo
            song_name = track.get("name")
            artist_name = track["artists"][0]["name"] if track.get("artists") else "Unknown"
            if song_name and artist_name:
                playlist_song_name_artist.add((song_name, artist_name))

    print("Fetching saved songs...")
    saved_songs = api.get_saved_songs()
    not_in_playlists = []
    for song in saved_songs:
        track = song.get("track")
        if not track:
            continue
        song_id = track.get("id")
        song_name = track.get("name")
        artist_name = track["artists"][0]["name"] if track.get("artists") else "Unknown"
        # If song id not in playlist ids, check name/artist combo
        if song_id not in playlist_song_ids and (song_name, artist_name) not in playlist_song_name_artist:
            not_in_playlists.append({
                "id": song_id,
                "name": song_name,
                "artist": artist_name
            })

    with open(filePath + 'savedSongsInNoPlaylists.txt', 'w') as file:
        for entry in not_in_playlists:
            file.write(f"{entry['name']} | {entry['artist']} | {entry['id']}\n")

    print(f"Wrote {len(not_in_playlists)} saved songs not in any playlist to savedSongsInNoPlaylists.txt")
    end_time = time.time()
    print(f"Total time: {end_time - start_time} seconds")

if __name__ == "__main__":
    main()
