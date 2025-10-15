# Eli Dow
# September 2025
# MySPStats POC - List Most Appeared Playlist Songs

import os
import time
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")
scope = "playlist-read-private playlist-read-collaborative"

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

    freq = {}
    song_info = {}

    print("Fetching songs from playlists...")
    for playlist in playlists:
        playlist_id = playlist["id"]
        playlist_name = playlist["name"]
        playlist_data = api.get_playlist(playlist_id)
        for item in playlist_data["tracks"]["items"]:
            track = item.get("track")
            if not track or not track.get("id"):
                continue
            song_id = track["id"]
            song_name = track["name"]
            artist_name = track["artists"][0]["name"] if track["artists"] else "Unknown"
            if song_id in freq:
                freq[song_id]["count"] += 1
                freq[song_id]["playlists"].add(playlist_name)
            else:
                freq[song_id] = {
                    "count": 1,
                    "name": song_name,
                    "artist": artist_name,
                    "id": song_id,
                    "playlists": set([playlist_name])
                }

    # Convert to list and sort
    freq_list = list(freq.values())
    freq_list.sort(key=lambda x: (-x["count"], x["name"]))

    with open(filePath + 'mostFrequentPlaylistSongs.txt', 'w') as file:
        for entry in freq_list:
            # Print count, song name, artist, id, and all playlist names it appeared in
            playlists_str = ", ".join(sorted(entry["playlists"]))
            file.write(f"{entry['count']}: {entry['name']} | {entry['artist']} | {entry['id']} | Playlists: {playlists_str}\n")

    print(f"Wrote {len(freq_list)} unique songs to mostFrequentPlaylistSongs.txt")
    end_time = time.time()
    print(f"Total time: {end_time - start_time} seconds")

if __name__ == "__main__":
    main()
