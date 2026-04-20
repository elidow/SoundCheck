# Eli Dow
# January 2026
# SoundCheck POC - Generate song intersection/comparison statistics

import os
import time
from datetime import datetime
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")

def main():
    start_time = time.time()
    
    # Initialize Spotify API with all necessary scopes
    scope = "playlist-read-private playlist-read-collaborative user-library-read user-top-read"
    
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)
    
    # Fetch all data
    print("Fetching playlists...")
    playlists = api.get_playlists()
    print(f"Found {len(playlists)} playlists.")
    
    print("Fetching saved songs...")
    saved_songs = api.get_saved_songs()
    print(f"Found {len(saved_songs)} saved songs.")
    
    print("Fetching top songs (long_term)...")
    top_songs = api.get_top_songs(time_range="long_term")
    print(f"Found {len(top_songs)} top songs.")

    # Human-friendly generated date for output files
    current_date = datetime.now().strftime("%m/%d/%Y")
    
    # Process saved songs
    print("Processing saved songs...")
    saved_songs_dict = {}  # id -> full info
    saved_songs_list = []  # for maintaining order
    saved_songs_name_artist_set = set()  # (name, artist) tuples for matching
    
    for song in saved_songs:
        track = song.get("track")
        if not track or not track.get("id"):
            continue
        track_id = track["id"]
        song_name = track.get("name", "Unknown")
        artist_name = track["artists"][0]["name"] if track.get("artists") else "Unknown"
        
        saved_songs_dict[track_id] = {
            "name": song_name,
            "artist": artist_name,
            "id": track_id
        }
        saved_songs_list.append(track_id)
        saved_songs_name_artist_set.add((song_name, artist_name))
    
    # Process top songs
    print("Processing top songs...")
    top_songs_dict = {}  # id -> full info
    top_songs_list = []  # for maintaining order
    
    for track in top_songs:
        if not track or not track.get("id"):
            continue
        track_id = track["id"]
        song_name = track.get("name", "Unknown")
        artist_name = track["artists"][0]["name"] if track.get("artists") else "Unknown"
        
        top_songs_dict[track_id] = {
            "name": song_name,
            "artist": artist_name,
            "id": track_id
        }
        top_songs_list.append(track_id)
    
    # Process playlist songs
    print("Processing playlist songs...")
    playlist_songs_dict = {}  # id -> {count, name, artist}
    playlist_song_playlists = {}  # id -> {name -> count}
    
    for playlist in playlists:
        playlist_id = playlist["id"]
        playlist_name = playlist["name"]
        playlist_data = api.get_playlist(playlist_id)
        
        for item in playlist_data["tracks"]["items"]:
            track = item.get("track")
            if not track or not track.get("id"):
                continue
            track_id = track["id"]
            song_name = track.get("name", "Unknown")
            artist_name = track["artists"][0]["name"] if track.get("artists") else "Unknown"
            
            if track_id not in playlist_songs_dict:
                playlist_songs_dict[track_id] = {
                    "count": 0,
                    "name": song_name,
                    "artist": artist_name,
                    "id": track_id,
                    "playlists": {}
                }
            
            playlist_songs_dict[track_id]["count"] += 1
            if playlist_name not in playlist_songs_dict[track_id]["playlists"]:
                playlist_songs_dict[track_id]["playlists"][playlist_name] = 0
            playlist_songs_dict[track_id]["playlists"][playlist_name] += 1
    
    # Helper function to format song line
    def format_song_line(song_info):
        return f"{song_info['name']} | {song_info['artist']} | {song_info['id']}"
    
    # Helper function to format playlist song line
    def format_playlist_song_line(song_info):
        playlists_str = ", ".join(sorted(song_info["playlists"].keys()))
        return f"{song_info['count']}: {song_info['name']} | {song_info['artist']} | {song_info['id']} | Playlists: {playlists_str}"
    
    # Write savedSongs.txt
    print("Writing savedSongs.txt...")
    with open(filePath + 'intersections/savedSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_id in saved_songs_list:
            if song_id in saved_songs_dict:
                file.write(format_song_line(saved_songs_dict[song_id]) + "\n")
    
    # Write topSongs.txt
    print("Writing topSongs.txt...")
    with open(filePath + 'intersections/topSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_id in top_songs_list:
            if song_id in top_songs_dict:
                file.write(format_song_line(top_songs_dict[song_id]) + "\n")
    
    # Write savedSongsInTopSongs.txt (in order of topSongs)
    print("Writing savedSongsInTopSongs.txt...")
    with open(filePath + 'intersections/savedSongsInTopSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_id in top_songs_list:
            if song_id in saved_songs_dict:
                file.write(format_song_line(saved_songs_dict[song_id]) + "\n")
    
    # Write savedSongsNotInTopSongs.txt (in order of savedSongs)
    print("Writing savedSongsNotInTopSongs.txt...")
    with open(filePath + 'intersections/savedSongsNotInTopSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_id in saved_songs_list:
            if song_id not in top_songs_dict and song_id in saved_songs_dict:
                file.write(format_song_line(saved_songs_dict[song_id]) + "\n")
    
    # Write topSongsNotInSavedSongs.txt (in order of topSongs)
    print("Writing topSongsNotInSavedSongs.txt...")
    with open(filePath + 'intersections/topSongsNotInSavedSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_id in top_songs_list:
            if song_id not in saved_songs_dict and song_id in top_songs_dict:
                song_info = top_songs_dict[song_id]
                name_artist_match = (song_info["name"], song_info["artist"]) in saved_songs_name_artist_set
                prefix = "(R) " if name_artist_match else ""
                file.write(prefix + format_song_line(song_info) + "\n")
    
    # Write savedSongsInPlaylists.txt (ordered by frequency in playlists, descending)
    print("Writing savedSongsInPlaylists.txt...")
    saved_in_playlists = []
    for song_id in saved_songs_list:
        if song_id in playlist_songs_dict and song_id in saved_songs_dict:
            song_info = playlist_songs_dict[song_id].copy()
            song_info.update(saved_songs_dict[song_id])
            saved_in_playlists.append(song_info)
    
    saved_in_playlists.sort(key=lambda x: (-x["count"], x["name"]))
    with open(filePath + 'intersections/savedSongsInPlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in saved_in_playlists:
            file.write(format_playlist_song_line(song_info) + "\n")
    
    # Write savedSongsNotInPlaylists.txt
    print("Writing savedSongsNotInPlaylists.txt...")
    saved_not_in_playlists = []
    for song_id in saved_songs_list:
        if song_id not in playlist_songs_dict and song_id in saved_songs_dict:
            saved_not_in_playlists.append(saved_songs_dict[song_id])
    
    with open(filePath + 'intersections/savedSongsNotInPlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in saved_not_in_playlists:
            file.write(format_song_line(song_info) + "\n")
    
    # Write playlistSongsNotInSavedSongs.txt (ordered by frequency, descending)
    print("Writing playlistSongsNotInSavedSongs.txt...")
    playlist_not_in_saved = []
    for song_id, song_info in playlist_songs_dict.items():
        if song_id not in saved_songs_dict:
            playlist_not_in_saved.append(song_info)
    
    playlist_not_in_saved.sort(key=lambda x: (-x["count"], x["name"]))
    with open(filePath + 'intersections/playlistSongsNotInSavedSongs.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in playlist_not_in_saved:
            file.write(format_playlist_song_line(song_info) + "\n")
    
    # Write remove-savedSongsNotInTopSongsOrPlaylists.txt
    # (intersection of savedSongsNotInTopSongs and savedSongsNotInPlaylists)
    print("Writing remove-savedSongsNotInTopSongsOrPlaylists.txt...")
    not_in_top_or_playlists = []
    for song_id in saved_songs_list:
        if song_id not in top_songs_dict and song_id not in playlist_songs_dict and song_id in saved_songs_dict:
            not_in_top_or_playlists.append(saved_songs_dict[song_id])
    
    with open(filePath + 'intersections/remove-savedSongsNotInTopSongsOrPlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in not_in_top_or_playlists:
            file.write(format_song_line(song_info) + "\n")
    
    # Write savedSongsNotInTopSongsButInPlaylists.txt
    # (saved songs not in top songs but in playlists)
    print("Writing savedSongsNotInTopSongsButInPlaylists.txt...")
    not_in_top_but_in_playlists = []
    for song_id in saved_songs_list:
        if song_id not in top_songs_dict and song_id in playlist_songs_dict and song_id in saved_songs_dict:
            song_info = playlist_songs_dict[song_id].copy()
            song_info.update(saved_songs_dict[song_id])
            not_in_top_but_in_playlists.append(song_info)
    
    not_in_top_but_in_playlists.sort(key=lambda x: (-x["count"], x["name"]))
    with open(filePath + 'intersections/savedSongsNotInTopSongsButInPlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in not_in_top_but_in_playlists:
            file.write(format_playlist_song_line(song_info) + "\n")

    # Write savedSongsInTopSongsButNotInPlaylists.txt
    print("Writing savedSongsInTopSongsButNotInPlaylists.txt...")
    saved_in_top_not_playlists = []
    for song_id in top_songs_list:
        # Song must be saved, in top songs, and NOT in any playlist
        if song_id in saved_songs_dict and song_id not in playlist_songs_dict:
            saved_in_top_not_playlists.append(saved_songs_dict[song_id])

    with open(filePath + 'intersections/savedSongsInTopSongsButNotInPlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_info in saved_in_top_not_playlists:
            file.write(format_song_line(song_info) + "\n")
    print(f"Wrote {len(saved_in_top_not_playlists)} songs to savedSongsInTopSongsButNotInPlaylists.txt")

    # Write add-unsavedSongsInTopSongsAndInMultiplePlaylists.txt
    print("Writing add-unsavedSongsInTopSongsAndInMultiplePlaylists.txt...")
    # Load topSongsNotInSavedSongs.txt ids, ignoring lines starting with (R)
    top_songs_not_in_saved_ids = set()
    try:
        with open(filePath + 'intersections/topSongsNotInSavedSongs.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("Generated on"):
                    continue
                if line.startswith("(R)"):
                    continue
                parts = line.split("|")
                if len(parts) >= 3:
                    track_id = parts[2].strip()
                    top_songs_not_in_saved_ids.add(track_id)
    except Exception as e:
        print(f"Error reading topSongsNotInSavedSongs.txt: {e}")

    # Find playlistSongsNotInSavedSongs.txt songs in 2+ playlists and in topSongsNotInSavedSongs.txt
    add_songs = []
    try:
        with open(filePath + 'intersections/playlistSongsNotInSavedSongs.txt', 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("Generated on"):
                    continue
                # Format: count: Song | Artist | ID | Playlists: ...
                parts = line.split("|")
                if len(parts) >= 3 and ":" in parts[0]:
                    count_part = parts[0].split(":")[0].strip()
                    try:
                        count = int(count_part)
                    except ValueError:
                        continue
                    track_id = parts[2].strip()
                    if count >= 2 and track_id in top_songs_not_in_saved_ids:
                        add_songs.append(line)
    except Exception as e:
        print(f"Error reading playlistSongsNotInSavedSongs.txt: {e}")

    with open(filePath + 'intersections/add-unsavedSongsInTopSongsAndInMultiplePlaylists.txt', 'w') as file:
        file.write(f"Generated on {current_date}\n")
        for song_line in add_songs:
            file.write(song_line + "\n")
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nComplete!")
    print(f"Wrote {len(saved_songs_list)} saved songs to savedSongs.txt")
    print(f"Wrote {len(top_songs_list)} top songs to topSongs.txt")
    print(f"Wrote {len([s for s in saved_songs_list if s in top_songs_dict])} songs to savedSongsInTopSongs.txt")
    print(f"Wrote {len([s for s in saved_songs_list if s not in top_songs_dict])} songs to savedSongsNotInTopSongs.txt")
    print(f"Wrote {len([s for s in top_songs_list if s not in saved_songs_dict])} songs to topSongsNotInSavedSongs.txt")
    print(f"Wrote {len(saved_in_playlists)} songs to savedSongsInPlaylists.txt")
    print(f"Wrote {len(saved_not_in_playlists)} songs to savedSongsNotInPlaylists.txt")
    print(f"Wrote {len(playlist_not_in_saved)} songs to playlistSongsNotInSavedSongs.txt")
    print(f"Wrote {len(not_in_top_but_in_playlists)} songs to savedSongsNotInTopSongsButInPlaylists.txt")
    print(f"Wrote {len(saved_in_top_not_playlists)} songs to savedSongsInTopSongsButNotInPlaylists.txt")
    print(f"Wrote {len(add_songs)} songs to add-unsavedSongsInTopSongsAndInMultiplePlaylists.txt")
    print(f"Wrote {len(not_in_top_or_playlists)} songs to remove-savedSongsNotInTopSongsOrPlaylists.txt")
    print(f"Total time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
