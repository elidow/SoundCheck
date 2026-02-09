#!/usr/bin/env python3
"""
POC8 - List playlist song timestamps

Creates two files:
 - playlistSongsWithTimestamps.txt
 - playlistSongsWithCrossfadeTimestamps.txt

Each line format:
  {Song Name} {Song Artist} {Song Length} {Playlist_Timestamp}

Constants to set below: PLAYLIST_ID, CROSSFADE_SECONDS

Uses the project's SpotifyWebApi class (PKCE flow) for authentication.
"""

import os
import time
from datetime import datetime
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
FILE_PATH = os.getenv("FILE_PATH", "")

# ----- Edit these constants -----
PLAYLIST_ID = "4TJxu2T8yhztGBxVXcZscc"
CROSSFADE_SECONDS = 6
# -------------------------------

def format_seconds_to_hh_mm_ss(seconds: int) -> str:
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60
    secs = seconds % 60
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def main():
    start_time = time.time()

    scope = "playlist-read-private playlist-read-collaborative"
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    print(f"Fetching playlist {PLAYLIST_ID}...")
    playlist = api.get_playlist(PLAYLIST_ID)
    items = playlist.get("tracks", {}).get("items", [])
    print(f"Found {len(items)} track items in playlist.")

    out_lines = []

    def truncate_cell(s: str, limit: int = 60) -> str:
        s = str(s)
        return s if len(s) <= limit else s[:limit]

    cumulative_seconds = 0

    for idx, item in enumerate(items):
        track = item.get("track")
        if not track:
            continue

        # Skip local or unavailable tracks that don't have duration_ms
        duration_ms = track.get("duration_ms")
        if duration_ms is None:
            continue

        song_seconds = int(duration_ms // 1000)
        song_length_str = format_seconds_to_hh_mm_ss(song_seconds)

        artist = "Unknown"
        artists = track.get("artists")
        if artists and len(artists) > 0:
            artist = artists[0].get("name", "Unknown")

        song_name = track.get("name", "Unknown")

        # Playlist timestamp is the time the song starts: cumulative seconds of all prior songs
        playlist_timestamp_seconds = cumulative_seconds
        playlist_timestamp_str = format_seconds_to_hh_mm_ss(playlist_timestamp_seconds)

        # Crossfade-adjusted timestamp subtracts crossfade seconds for each previous transition
        # i.e., for the song at index idx (0-based) there are idx previous transitions
        crossfade_adjustment = CROSSFADE_SECONDS * idx
        crossfade_timestamp_seconds = max(0, playlist_timestamp_seconds - crossfade_adjustment)
        crossfade_timestamp_str = format_seconds_to_hh_mm_ss(crossfade_timestamp_seconds)

        # collect structured line data for later padding (truncate to 60 chars per column)
        out_lines.append((
            truncate_cell(song_name, 60),
            truncate_cell(artist, 60),
            truncate_cell(song_length_str, 60),
            truncate_cell(playlist_timestamp_str, 60),
            truncate_cell(crossfade_timestamp_str, 60),
        ))

        # advance cumulative by this song's full duration
        cumulative_seconds += song_seconds

    # Ensure output directory exists
    if FILE_PATH and not FILE_PATH.endswith(os.path.sep):
        FILE_PATH_DIR = FILE_PATH
    else:
        FILE_PATH_DIR = FILE_PATH

    out_file_1 = os.path.join(FILE_PATH_DIR, 'playlistSongsWithTimestamps.txt')

    # compute column widths
    col_widths = [0, 0, 0, 0, 0]
    for parts in out_lines:
        for i, part in enumerate(parts):
            col_widths[i] = max(col_widths[i], len(str(part)))

    # build padded lines
    padded_lines = []
    for parts in out_lines:
        song_name, artist, song_length_str, playlist_timestamp_str, crossfade_timestamp_str = parts
        line = (
            f"{song_name.ljust(col_widths[0])} | "
            f"{artist.ljust(col_widths[1])} | "
            f"{song_length_str.rjust(col_widths[2])} | "
            f"{playlist_timestamp_str.rjust(col_widths[3])} | "
            f"{crossfade_timestamp_str.rjust(col_widths[4])}\n"
        )
        padded_lines.append(line)

    # Human-friendly generated date for output files
    current_date = datetime.now().strftime("%m/%d/%Y")

    with open(out_file_1, 'w', encoding='utf-8') as f:
        f.write(f"Generated on {current_date}\n")
        f.writelines(padded_lines)

    print(f"Wrote {len(padded_lines)} lines to {out_file_1}")

    end_time = time.time()
    print(f"Completed in {end_time - start_time:.2f}s")


if __name__ == '__main__':
    main()
