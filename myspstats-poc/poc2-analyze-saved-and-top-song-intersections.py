# Eli Dow
# January 2025
# MySPStats POC in Python



import os
import time
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")
scope = "user-read-private user-read-email playlist-read-private user-top-read user-library-read"

# Main function
def main():
    start_time = time.time()

    # initialize Spotify API
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    # Fetch saved songs and save to file
    print("Fetching saved songs...")
    fetched_songs = api.get_saved_songs()
    savedSongs = []
    with open(filePath + 'savedSongs.txt', 'w') as file:
        for song in fetched_songs:
            songName = song['track']['name']
            songArtist = song['track']['artists'][0]['name']
            songId = song['track']['id']
            savedSongs.append({
                "name": songName,
                "artist": songArtist,
                "id": songId
            })
            file.write(f"{songName} | {songArtist} | {songId}\n")

    # Fetch top songs, mark ones that are saved, and save to file
    print("Fetching top songs...")
    fetchedTopSongs = api.get_top_songs(time_range="long_term")
    topSongs = []
    topSavedSongs = []
    with open(filePath + 'topSongs.txt', 'w') as file:
        for song in fetchedTopSongs:
            songName = song['name']
            songArtist = song['artists'][0]['name']
            songId = song['id']
            topSongs.append({
                "name": songName,
                "artist": songArtist,
                "id": songId
            })
            if songId in [s['id'] for s in savedSongs]:
                topSavedSongs.append(topSongs[-1])
            file.write(f"{songName} | {songArtist} | {songId}\n")

    # Save top saved songs to file
    with open(filePath + 'topSavedSongs.txt', 'w') as file:
        for song in topSavedSongs:
            file.write(f"{song['name']} | {song['artist']} | {song['id']}\n")

    # Save saved songs that are not top songs to file
    top_song_ids = {song['id'] for song in topSongs}
    savedSongsNotInTopSongs = [song for song in savedSongs if song['id'] not in top_song_ids]
    with open(filePath + 'savedSongsNotInTopSongs.txt', 'w') as file:
        for song in savedSongsNotInTopSongs:
            file.write(f"{song['name']} | {song['artist']} | {song['id']}\n")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total time: {total_time} seconds")

if __name__ == "__main__":
    main()