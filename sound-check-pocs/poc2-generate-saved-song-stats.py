# Eli Dow
# January 2026
# SoundCheck POC - Generate comprehensive saved song statistics

import os
import time
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")
scope = "user-library-read"

def format_duration_short(ms):
    """Convert milliseconds to MM:SS.### format"""
    total_seconds = ms / 1000
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:06.3f}"

def format_duration_long(ms):
    """Convert milliseconds to 'MM minutes and SS.### seconds' format"""
    total_seconds = ms / 1000
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes} minutes and {seconds:06.3f} seconds"

def main():
    start_time = time.time()
    
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    print("Fetching saved songs...")
    saved_songs = api.get_saved_songs()
    print(f"Found {len(saved_songs)} saved songs.")

    # Data structures for analysis
    artist_freq = {}
    album_freq = {}
    songs_list = []
    seen_songs = {}
    duplicates = []

    # Process all saved songs
    print("Processing saved songs...")
    for song in saved_songs:
        track = song.get("track")
        if not track:
            continue
        
        track_id = track.get("id")
        track_name = track.get("name", "Unknown")
        popularity = track.get("popularity", 0)
        duration_ms = track.get("duration_ms", 0)
        artists = track.get("artists", [])
        album = track.get("album", {})
        
        # Get first artist info
        if artists and artists[0].get("id"):
            artist_id = artists[0]["id"]
            artist_name = artists[0].get("name", "Unknown")
        else:
            artist_id = None
            artist_name = "Unknown"
        
        # Get album info
        if album and album.get("id"):
            album_id = album["id"]
            album_name = album.get("name", "Unknown")
            release_date = album.get("release_date", "Unknown")
        else:
            album_id = None
            album_name = "Unknown"
            release_date = "Unknown"
        
        # Track artist frequency
        if artist_id:
            if artist_id in artist_freq:
                artist_freq[artist_id]["count"] += 1
            else:
                artist_freq[artist_id] = {"name": artist_name, "count": 1}
        
        # Track album frequency
        if album_id:
            if album_id in album_freq:
                album_freq[album_id]["count"] += 1
            else:
                album_freq[album_id] = {"name": album_name, "album_artist": artist_name, "count": 1}
        
        # Track songs for popularity and duration analysis
        songs_list.append({
            "id": track_id,
            "name": track_name,
            "artist": artist_name,
            "popularity": popularity,
            "duration_ms": duration_ms,
            "artist_id": artist_id,
            "release_date": release_date
        })
        
        # Track duplicates by ID or by artist + name
        song_key = track_id
        if song_key in seen_songs:
            duplicates.append({
                "id": track_id,
                "name": track_name,
                "artist": artist_name,
                "duplicate_type": "ID"
            })
        else:
            seen_songs[song_key] = {"name": track_name, "artist": artist_name}
        
        # Also check for duplicates by artist + name
        artist_name_key = (artist_name, track_name)
        if artist_name_key in seen_songs:
            # Check if it's a different ID (only add if not already detected by ID)
            if track_id not in seen_songs:
                duplicates.append({
                    "id": track_id,
                    "name": track_name,
                    "artist": artist_name,
                    "duplicate_type": "Artist+Name"
                })
    
    # Write most frequent artists
    print("Writing most frequent artists...")
    artist_list = [(v["name"], v["count"]) for v in artist_freq.values()]
    sorted_artists = sorted(artist_list, key=lambda x: (-x[1], x[0]))
    
    with open(filePath + 'saved-songs/mostFrequentArtistsInSavedSongs.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        for artist, count in sorted_artists:
            file.write(f"{count}: {artist}\n")
    
    # Write most frequent albums
    print("Writing most frequent albums...")
    album_list = [(v["name"], v["album_artist"], v["count"]) for v in album_freq.values()]
    sorted_albums = sorted(album_list, key=lambda x: (-x[2], x[0]))
    
    with open(filePath + 'saved-songs/mostFrequentAlbumsInSavedSongs.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        for album, album_artist, count in sorted_albums:
            if album_artist:
                file.write(f"{count}: {album} — {album_artist}\n")
            else:
                file.write(f"{count}: {album}\n")
    
    # Write songs ordered by popularity
    print("Writing songs ordered by popularity...")
    sorted_by_popularity = sorted(songs_list, key=lambda x: (-x["popularity"], x["name"]))
    
    with open(filePath + 'saved-songs/songsOrderedByPopularity.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        for song in sorted_by_popularity:
            file.write(f"{song['popularity']}: {song['name']} - {song['artist']}\n")
    
    # Write songs ordered by duration
    print("Writing songs ordered by duration...")
    sorted_by_duration = sorted(songs_list, key=lambda x: (-x["duration_ms"], x["name"]))
    
    with open(filePath + 'saved-songs/songsOrderedByDuration.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        for song in sorted_by_duration:
            duration_formatted = format_duration_long(song["duration_ms"])
            file.write(f"{duration_formatted}: {song['name']} - {song['artist']}\n")
    
    # Write songs ordered by release date
    print("Writing songs ordered by release date...")
    sorted_by_release_date = sorted(songs_list, key=lambda x: (x["release_date"], x["name"]))
    
    with open(filePath + 'saved-songs/songsOrderedByReleaseDate.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        for song in sorted_by_release_date:
            file.write(f"{song['release_date']}: {song['name']} - {song['artist']}\n")
    
    # Write duplicates
    print("Writing duplicates...")
    with open(filePath + 'saved-songs/repeats.txt', 'w') as file:
        file.write("Generated on 01/29/2026\n")
        if duplicates:
            for dup in duplicates:
                file.write(f"{dup['name']} — {dup['artist']} | ID: {dup['id']} | Type: {dup['duplicate_type']}\n")
        else:
            file.write("No duplicates found.\n")
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nComplete!")
    print(f"Wrote {len(sorted_artists)} unique artists to mostFrequentArtistsInSavedSongs.txt")
    print(f"Wrote {len(sorted_albums)} unique albums to mostFrequentAlbumsInSavedSongs.txt")
    print(f"Wrote {len(sorted_by_popularity)} songs to songsOrderedByPopularity.txt")
    print(f"Wrote {len(sorted_by_duration)} songs to songsOrderedByDuration.txt")
    print(f"Wrote {len(sorted_by_release_date)} songs to songsOrderedByReleaseDate.txt")
    print(f"Wrote {len(duplicates)} duplicates to repeats.txt")
    print(f"Total time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
