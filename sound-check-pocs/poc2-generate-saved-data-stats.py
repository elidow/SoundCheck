# Eli Dow
# January 2026
# SoundCheck POC - Generate comprehensive saved song statistics

import os
import time
from datetime import datetime
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

    # Human-friendly generated date for output files
    current_date = datetime.now().strftime("%m/%d/%Y")

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
    
    # Ensure output directories exist in saved-data
    base_output_dir = os.path.join(filePath, 'saved-data')
    os.makedirs(os.path.join(base_output_dir, 'songs'), exist_ok=True)
    os.makedirs(os.path.join(base_output_dir, 'albums'), exist_ok=True)
    os.makedirs(os.path.join(base_output_dir, 'artists'), exist_ok=True)

    # Write most frequent artists
    print("Writing most frequent artists in saved data...")
    artist_list = [(artist_id, v["name"], v["count"]) for artist_id, v in artist_freq.items()]
    sorted_artists = sorted(artist_list, key=lambda x: (-x[2], x[1]))
    
    with open(os.path.join(base_output_dir, 'artists', 'mostFrequentArtistsInSavedSongs.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for artist_id, artist_name, count in sorted_artists:
            file.write(f"{count} | {artist_name} | {artist_id}\n")

    # Write most frequent albums
    print("Writing most frequent albums in saved data...")
    album_list = [(album_id, v["name"], v["album_artist"], v["count"]) for album_id, v in album_freq.items()]
    sorted_albums = sorted(album_list, key=lambda x: (-x[3], x[1]))
    
    with open(os.path.join(base_output_dir, 'albums', 'mostFrequentAlbumsInSavedSongs.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for album_id, album_name, album_artist, count in sorted_albums:
            file.write(f"{count} | {album_name} | {album_artist} | {album_id}\n")
    
    # Write saved songs ordered by popularity
    print("Writing songs ordered by popularity...")
    sorted_by_popularity = sorted(songs_list, key=lambda x: (-x["popularity"], x["name"]))
    
    with open(os.path.join(base_output_dir, 'songs', 'savedSongsOrderedByPopularity.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song in sorted_by_popularity:
            file.write(f"{song['popularity']}: {song['name']} - {song['artist']}\n")
    
    # Write saved songs ordered by duration
    print("Writing songs ordered by duration...")
    sorted_by_duration = sorted(songs_list, key=lambda x: (-x["duration_ms"], x["name"]))
    
    with open(os.path.join(base_output_dir, 'songs', 'savedSongsOrderedByDuration.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song in sorted_by_duration:
            duration_formatted = format_duration_long(song["duration_ms"])
            file.write(f"{duration_formatted}: {song['name']} - {song['artist']}\n")
    
    # Write saved songs ordered by release date
    print("Writing songs ordered by release date...")
    sorted_by_release_date = sorted(songs_list, key=lambda x: (x["release_date"], x["name"]))
    
    with open(os.path.join(base_output_dir, 'songs', 'savedSongsOrderedByReleaseDate.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song in sorted_by_release_date:
            file.write(f"{song['release_date']}: {song['name']} - {song['artist']}\n")
    
    # Write duplicates
    print("Writing duplicates...")
    with open(os.path.join(base_output_dir, 'songs', 'repeats.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        if duplicates:
            for dup in duplicates:
                file.write(f"{dup['name']} — {dup['artist']} | ID: {dup['id']} | Type: {dup['duplicate_type']}\n")
        else:
            file.write("No duplicates found.\n")

    # Extended album analysis for albums with 3+ saved tracks
    print("Fetching full album details for albums with >=3 saved songs...")
    high_freq_album_ids = [album_id for album_id, v in album_freq.items() if v["count"] >= 3]
    album_stats = []
    if high_freq_album_ids:
        album_details = api.get_albums(high_freq_album_ids)
        album_map = {a.get('id'): a for a in album_details if a and a.get('id')}

        def parse_release_date(date_str):
            for fmt in ("%Y-%m-%d", "%Y-%m", "%Y"):
                try:
                    return datetime.strptime(date_str, fmt)
                except Exception:
                    continue
            return None

        for album_id in high_freq_album_ids:
            saved_count = album_freq[album_id]["count"]
            album_name = album_freq[album_id]["name"]
            artist_name = album_freq[album_id].get("album_artist", "Unknown")
            detail = album_map.get(album_id, {})
            total_tracks = detail.get("total_tracks", 0)
            popularity = detail.get("popularity", 0)
            release_date = detail.get("release_date", "")
            release_date_parsed = parse_release_date(release_date) if release_date else None
            saved_percentage = (saved_count / total_tracks * 100.0) if total_tracks else 0.0
            album_stats.append({
                "id": album_id,
                "name": album_name,
                "artist_name": artist_name,
                "saved_count": saved_count,
                "total_tracks": total_tracks,
                "saved_percentage": saved_percentage,
                "popularity": popularity,
                "release_date": release_date,
                "release_date_parsed": release_date_parsed
            })

    # Write saved albums ordered by # of tracks
    print("Writing saved albums ordered by # of tracks...")
    with open(os.path.join(base_output_dir, 'albums', 'savedAlbumsOrderedByTracks.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for album in sorted(album_stats, key=lambda x: (-x["total_tracks"], x["name"])):
            file.write(f"{album['total_tracks']} | {album['name']} | {album['artist_name']} | {album['id']}\n")

    # Write saved albums ordered by % of saved tracks
    print("Writing saved albums ordered by percentage of saved tracks...")
    with open(os.path.join(base_output_dir, 'albums', 'savedAlbumsOrderedBySavedTracks.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for album in sorted(album_stats, key=lambda x: (-x["saved_percentage"], -x["saved_count"])):
            file.write(f"{album['saved_percentage']:.2f}% | {album['saved_count']}/{album['total_tracks']} | {album['name']} | {album['artist_name']} | {album['id']}\n")

    # Write saved albums ordered by popularity
    print("Writing saved albums ordered by popularity...")
    with open(os.path.join(base_output_dir, 'albums', 'savedAlbumsOrderedByPopularity.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for album in sorted(album_stats, key=lambda x: (-x["popularity"], x["name"])):
            file.write(f"{album['popularity']} | {album['name']} | {album['artist_name']} | {album['id']}\n")

    # Write saved albums ordered by release date
    print("Writing saved albums ordered by release date...")
    ordered_by_date = sorted(album_stats, key=lambda x: (x["release_date_parsed"] or datetime.max))
    with open(os.path.join(base_output_dir, 'albums', 'savedAlbumsOrderedByReleaseDate.txt'), 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for album in ordered_by_date:
            file.write(f"{album['release_date']} | {album['name']} | {album['artist_name']} | {album['id']}\n")


    # Extended artist analysis for artists with 5+ saved songs
    print("Fetching full artist details for artists with >=5 saved songs...")
    high_freq_artist_ids = [artist_id for artist_id, v in artist_freq.items() if v["count"] >= 5]
    artist_stats = []
    if high_freq_artist_ids:
        artist_details = api.get_artists(high_freq_artist_ids)
        artist_map = {a.get('id'): a for a in artist_details if a and a.get('id')}

        for artist_id in high_freq_artist_ids:
            artist_name = artist_freq[artist_id]["name"]
            saved_count = artist_freq[artist_id]["count"]
            detail = artist_map.get(artist_id, {})
            popularity = detail.get("popularity", 0)
            followers = detail.get("followers", {}).get("total", 0)
            genres = ", ".join(detail.get("genres", []))
            artist_stats.append({
                "id": artist_id,
                "name": artist_name,
                "saved_count": saved_count,
                "popularity": popularity,
                "followers": followers,
                "genres": genres
            })

        # Write saved artists ordered by popularity
        print("Writing saved artists ordered by popularity...")
        with open(os.path.join(base_output_dir, 'artists', 'savedArtistsOrderedByPopularity.txt'), 'w') as file:
            file.write(f"Generated on {current_date}\n")
            for artist in sorted(artist_stats, key=lambda x: (-x["popularity"], x["name"])):
                file.write(f"{artist['popularity']} | {artist['name']} | {artist['saved_count']} saved | {artist['followers']} followers | {artist['id']}\n")

    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nComplete!")
    print(f"Wrote {len(sorted_by_popularity)} unqiue songs to songs folder")
    print(f"Wrote {len(sorted_albums)} unique albums to albums folder")
    print(f"Wrote {len(album_stats)} unique saved albums (3+ saved songs) to albums folder")
    print(f"Wrote {len(sorted_artists)} unique artists to artists folder")
    print(f"Wrote {len(high_freq_artist_ids)} unique saved artists (5+ saved songs) to artists folder")
    print(f"Wrote {len(duplicates)} duplicates to repeats.txt")
    print(f"Total time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
