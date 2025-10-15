# Eli Dow
# September 2025
# MySPStats POC - Most Frequent Artists In Saved Songs

import os
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH") or ""

out_file = os.path.join(filePath, 'mostFrequentArtistsInSavedSongs.txt')
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

    # freq keyed by artist id, value is dict with name and count
    freq = {}
    for song in saved_songs:
        track = song.get("track")
        if not track:
            continue
        artists = track.get("artists")
        if not artists or not artists[0].get("id"):
            continue
        artist_id = artists[0]["id"]
        artist_name = artists[0].get("name", "")
        if artist_id in freq:
            freq[artist_id]["count"] += 1
        else:
            freq[artist_id] = {"name": artist_name, "count": 1}

    # convert to list of (name, count) then sort by count desc, name asc
    artist_list = [(v["name"], v["count"]) for v in freq.values()]
    sorted_artists = sorted(artist_list, key=lambda x: (-x[1], x[0]))
    with open(out_file, 'w') as fout:
        for artist, count in sorted_artists:
            fout.write(f"{count}: {artist}\n")
    print(f"Wrote {len(sorted_artists)} artists to {out_file}")

if __name__ == "__main__":
    main()
