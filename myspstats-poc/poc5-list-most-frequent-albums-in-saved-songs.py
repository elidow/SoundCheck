# Eli Dow
# September 2025
# MySPStats POC - Most Frequent Albums In Saved Songs

import os
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH") or ""

out_file = os.path.join(filePath, 'mostFrequentAlbumsInSavedSongs.txt')
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

    # freq keyed by album id, value stores name, album_artist (from track artists[0]) and count
    freq = {}
    for song in saved_songs:
        track = song.get("track")
        if not track:
            continue
        album = track.get("album")
        if not album or not album.get("id"):
            continue
        album_id = album["id"]
        album_name = album.get("name", "")
        # album artist: take the track's first artist
        artists = track.get("artists") or []
        album_artist = artists[0].get("name") if artists and artists[0].get("name") else ""
        if album_id in freq:
            freq[album_id]["count"] += 1
        else:
            freq[album_id] = {"name": album_name, "album_artist": album_artist, "count": 1}

    # convert to list and sort by count desc then album name asc
    album_list = [(v["name"], v["album_artist"], v["count"]) for v in freq.values()]
    sorted_albums = sorted(album_list, key=lambda x: (-x[2], x[0]))
    with open(out_file, 'w') as fout:
        for album, album_artist, count in sorted_albums:
            if album_artist:
                fout.write(f"{count}: {album} — {album_artist}\n")
            else:
                fout.write(f"{count}: {album}\n")
    print(f"Wrote {len(sorted_albums)} albums to {out_file}")

if __name__ == "__main__":
    main()