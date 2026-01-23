# # Eli Dow
# # January 2026
# # SoundCheck POC - Save and unsave songs based on playlist and top tracks analysis
# # NOT WORKING

# import os
# import time
# from dotenv import load_dotenv
# from spotify_web_api import SpotifyWebApi

# load_dotenv()

# # Get the directory where this script is located
# SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# # File paths (relative to script location)
# PLAYLIST_SONGS_NOT_SAVED_PATH = os.path.join(SCRIPT_DIR, "personal_data/intersections/playlistSongsNotInSavedSongs.txt")
# REMOVE_SAVED_SONGS_PATH = os.path.join(SCRIPT_DIR, "personal_data/intersections/remove-savedSongsNotInTopPlayedOrPlaylists.txt")
# OUTPUT_PATH = os.path.join(SCRIPT_DIR, "personal_data/savedAndUnsavedSongs.txt")

# # Scope for Spotify API
# SCOPE = "user-library-read user-library-modify"

# def parse_song_line(line):
#     """
#     Parse a line from the song files.
#     Format: count: Song | Artist | ID | Playlists: ... (for playlistSongsNotInSavedSongs)
#     Format: Song | Artist | ID (for remove-savedSongsNotInTopPlayedOrPlaylists)
#     Returns (song_name, artist, track_id) or None if parsing fails
#     """
#     parts = line.strip().split(" | ")
    
#     # For playlistSongsNotInSavedSongs.txt format: "count: Song | Artist | ID | Playlists: ..."
#     if len(parts) >= 3 and ":" in parts[0]:
#         try:
#             # Extract the count from the first part
#             count_part = parts[0].split(":")[0]
#             count = int(count_part)
#             song = parts[0].split(": ", 1)[1]  # Get the song name after "count: "
#             artist = parts[1]
#             track_id = parts[2]
#             return (song, artist, track_id, count)
#         except (ValueError, IndexError):
#             return None
    
#     # For remove-savedSongsNotInTopPlayedOrPlaylists.txt format: "Song | Artist | ID"
#     elif len(parts) == 3:
#         try:
#             song = parts[0]
#             artist = parts[1]
#             track_id = parts[2]
#             return (song, artist, track_id)
#         except IndexError:
#             return None
    
#     return None

# def read_playlist_songs_not_in_saved():
#     """
#     Read playlistSongsNotInSavedSongs.txt and return a dict of track_id -> (song, artist, count)
#     Only returns songs that appear in 2 or more playlists.
#     """
#     songs_to_save = {}
    
#     if not os.path.exists(PLAYLIST_SONGS_NOT_SAVED_PATH):
#         print(f"Warning: {PLAYLIST_SONGS_NOT_SAVED_PATH} not found")
#         return songs_to_save
    
#     with open(PLAYLIST_SONGS_NOT_SAVED_PATH, 'r') as f:
#         for line in f:
#             parsed = parse_song_line(line)
#             if parsed and len(parsed) == 4:
#                 song, artist, track_id, count = parsed
#                 if count >= 2:  # Only songs in 2 or more playlists
#                     songs_to_save[track_id] = (song, artist, count)
    
#     return songs_to_save

# def read_remove_saved_songs():
#     """
#     Read remove-savedSongsNotInTopPlayedOrPlaylists.txt and return a dict of track_id -> (song, artist)
#     """
#     songs_to_unsave = {}
    
#     if not os.path.exists(REMOVE_SAVED_SONGS_PATH):
#         print(f"Warning: {REMOVE_SAVED_SONGS_PATH} not found")
#         return songs_to_unsave
    
#     with open(REMOVE_SAVED_SONGS_PATH, 'r') as f:
#         for line in f:
#             parsed = parse_song_line(line)
#             if parsed and len(parsed) == 3:
#                 song, artist, track_id = parsed
#                 songs_to_unsave[track_id] = (song, artist)
    
#     return songs_to_unsave

# def main():
#     start_time = time.time()
    
#     # Initialize Spotify API
#     api = SpotifyWebApi(scope=SCOPE)
#     code_verifier = api.generate_code_verifier()
#     code_challenge = api.generate_code_challenge(code_verifier)
#     authorization_url = api.get_authorization_url(code_challenge)
    
#     print("Go to this URL and authorize the app:\n", authorization_url)
#     authorization_code = input("Enter the code from the redirect URL: ").strip()
#     api.get_token_pkce(authorization_code, code_verifier)
    
#     # Read songs from files
#     print("Reading song data...")
#     songs_to_save = read_playlist_songs_not_in_saved()
#     songs_to_unsave = read_remove_saved_songs()
    
#     print(f"Found {len(songs_to_save)} songs to save (appear in 2+ playlists)")
#     print(f"Found {len(songs_to_unsave)} songs to unsave")
    
#     # Process save and unsave operations
#     saved_results = {"saved": [], "already_saved": [], "failed": []}
#     unsaved_results = {"unsaved": [], "not_saved": [], "failed": []}
    
#     if songs_to_save:
#         print(f"\nSaving {len(songs_to_save)} songs...")
#         track_ids_to_save = list(songs_to_save.keys())
        
#         try:
#             save_result = api.save_songs(track_ids_to_save)
#             saved_results["saved"] = save_result.get("saved", [])
#             saved_results["already_saved"] = save_result.get("already_saved", [])
#             saved_results["failed"] = save_result.get("failed", [])
            
#             print(f"  Successfully saved: {len(saved_results['saved'])} songs")
#             print(f"  Already saved: {len(saved_results['already_saved'])} songs")
#             if saved_results["failed"]:
#                 print(f"  Failed to save: {len(saved_results['failed'])} songs")
#         except Exception as e:
#             print(f"Error saving songs: {e}")
    
#     if songs_to_unsave:
#         print(f"\nUnsaving {len(songs_to_unsave)} songs...")
#         track_ids_to_unsave = list(songs_to_unsave.keys())
        
#         try:
#             unsave_result = api.unsave_songs(track_ids_to_unsave)
#             unsaved_results["unsaved"] = unsave_result.get("unsaved", [])
#             unsaved_results["not_saved"] = unsave_result.get("not_saved", [])
#             unsaved_results["failed"] = unsave_result.get("failed", [])
            
#             print(f"  Successfully unsaved: {len(unsaved_results['unsaved'])} songs")
#             print(f"  Were not saved: {len(unsaved_results['not_saved'])} songs")
#             if unsaved_results["failed"]:
#                 print(f"  Failed to unsave: {len(unsaved_results['failed'])} songs")
#         except Exception as e:
#             print(f"Error unsaving songs: {e}")
    
#     # Write results to file
#     # Create directory if it doesn't exist
#     output_dir = os.path.dirname(OUTPUT_PATH)
#     if output_dir and not os.path.exists(output_dir):
#         os.makedirs(output_dir)
    
#     with open(OUTPUT_PATH, 'w') as f:
#         f.write("=" * 80 + "\n")
#         f.write("SAVED SONGS\n")
#         f.write("=" * 80 + "\n\n")
        
#         if saved_results["saved"]:
#             f.write("Songs Successfully Saved:\n")
#             for track_id in saved_results["saved"]:
#                 song, artist, count = songs_to_save[track_id]
#                 f.write(f"  {count}: {song} | {artist} | {track_id}\n")
#             f.write(f"\nTotal Saved: {len(saved_results['saved'])}\n")
#         else:
#             f.write("No songs were saved.\n")
        
#         if saved_results["already_saved"]:
#             f.write(f"\nAlready Saved: {len(saved_results['already_saved'])}\n")
#             for track_id in saved_results["already_saved"]:
#                 song, artist, count = songs_to_save[track_id]
#                 f.write(f"  {count}: {song} | {artist} | {track_id}\n")
        
#         if saved_results["failed"]:
#             f.write(f"\nFailed to Save: {len(saved_results['failed'])}\n")
#             for track_id in saved_results["failed"]:
#                 song, artist, count = songs_to_save[track_id]
#                 f.write(f"  {count}: {song} | {artist} | {track_id}\n")
        
#         f.write("\n" + "=" * 80 + "\n")
#         f.write("UNSAVED SONGS\n")
#         f.write("=" * 80 + "\n\n")
        
#         if unsaved_results["unsaved"]:
#             f.write("Songs Successfully Unsaved:\n")
#             for track_id in unsaved_results["unsaved"]:
#                 song, artist = songs_to_unsave[track_id]
#                 f.write(f"  {song} | {artist} | {track_id}\n")
#             f.write(f"\nTotal Unsaved: {len(unsaved_results['unsaved'])}\n")
#         else:
#             f.write("No songs were unsaved.\n")
        
#         if unsaved_results["not_saved"]:
#             f.write(f"\nWere Not Saved: {len(unsaved_results['not_saved'])}\n")
#             for track_id in unsaved_results["not_saved"]:
#                 song, artist = songs_to_unsave[track_id]
#                 f.write(f"  {song} | {artist} | {track_id}\n")
        
#         if unsaved_results["failed"]:
#             f.write(f"\nFailed to Unsave: {len(unsaved_results['failed'])}\n")
#             for track_id in unsaved_results["failed"]:
#                 song, artist = songs_to_unsave[track_id]
#                 f.write(f"  {song} | {artist} | {track_id}\n")
    
#     print(f"Results written to {OUTPUT_PATH}")
    
#     # Calculate and display execution time
#     end_time = time.time()
#     execution_time = end_time - start_time
#     print(f"Execution time: {execution_time:.2f} seconds")

# if __name__ == "__main__":
#     main()
