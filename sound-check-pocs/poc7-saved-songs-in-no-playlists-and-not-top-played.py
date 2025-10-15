# Eli Dow
# September 2025
# SoundCheck POC - Saved Songs In No Playlists and Not Top Played

import os
from dotenv import load_dotenv

load_dotenv()
filePath = os.getenv("FILE_PATH")

not_top_file = filePath + 'savedSongsNotInTopSongs.txt'
not_in_playlists_file = filePath + 'savedSongsInNoPlaylists.txt'
out_file = filePath + 'savedSongsInNoPlaylistsAndNotTopPlayed.txt'

def main():
    with open(not_top_file, 'r') as f1:
        not_top_lines = [line.strip() for line in f1 if line.strip()]
    with open(not_in_playlists_file, 'r') as f2:
        not_in_playlists_lines = set(line.strip() for line in f2 if line.strip())
    intersection = [line for line in not_top_lines if line in not_in_playlists_lines]
    with open(out_file, 'w') as fout:
        for line in intersection:
            fout.write(line + '\n')
    print(f"Wrote {len(intersection)} lines to savedSongsInNoPlaylistsAndNotTopPlayed.txt")

if __name__ == "__main__":
    main()
