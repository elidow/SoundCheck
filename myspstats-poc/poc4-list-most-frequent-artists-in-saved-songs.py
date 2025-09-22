# Eli Dow
# September 2025
# MySPStats POC - Most Frequent Artists In Saved Songs

import os
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")

out_file = filePath + 'mostFrequentArtistsInSavedSongs.txt'
scope = "user-library-read"

def main():
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    print("Fetching saved songs...")
    saved_songs = api.get_saved_songs()
    freq = {}
    for song in saved_songs:
        track = song.get("track")
        if not track:
            continue
        artists = track.get("artists")
        if not artists or not artists[0].get("name"):
            continue
        main_artist = artists[0]["name"]
        if main_artist in freq:
            freq[main_artist] += 1
        else:
            freq[main_artist] = 1

    # Sort by count descending, then artist name ascending
    sorted_artists = sorted(freq.items(), key=lambda x: (-x[1], x[0]))
    with open(out_file, 'w') as fout:
        for artist, count in sorted_artists:
            fout.write(f"{count}: {artist}\n")
    print(f"Wrote {len(sorted_artists)} artists to mostFrequentArtistsInSavedSongs.txt")

if __name__ == "__main__":
    main()
