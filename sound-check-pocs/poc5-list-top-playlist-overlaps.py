# Eli Dow
# January 2026
# SoundCheck POC - List Playlist Overlaps (at least 4 common songs)

import os
from collections import Counter, defaultdict
from itertools import combinations
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()
filePath = os.getenv("FILE_PATH") or ""

input_file = os.path.join(filePath, 'playlist-songs/mostFrequentPlaylistSongs.txt')
output_file = os.path.join(filePath, 'playlistOverlaps.txt')

def main():
    pair_counter = Counter()
    pair_songs = defaultdict(set)

    with open(input_file, 'r') as fin:
        for line in fin:
            line = line.strip()
            if not line:
                continue
            # Format: count: Song Name | Artist | Id | Playlists: playlist1, playlist2, ...
            parts = line.split(' | Playlists: ')
            if len(parts) != 2:
                continue
            playlists_str = parts[1]
            playlists = [p.strip() for p in playlists_str.split(',')]
            # Remove duplicates if any
            playlists = list(set(playlists))
            # Extract the song name from the left side (after the leading count)
            left = parts[0]
            # left format: "count: Song Name | Artist | Id"
            song = left.split(': ', 1)[1].split(' | ')[0].strip() if ': ' in left else left.split(' | ')[0].strip()
            # Generate all unique pairs
            for pair in combinations(playlists, 2):
                # Sort the pair to make it unordered
                sorted_pair = tuple(sorted(pair))
                pair_counter[sorted_pair] += 1
                pair_songs[sorted_pair].add(song)

    # Filter for overlaps with at least 4 common songs and sort by count descending
    overlaps = [(pair, count) for pair, count in pair_counter.items() if count >= 4]
    overlaps.sort(key=lambda x: -x[1])
    # Human-friendly generated date for output files
    current_date = datetime.now().strftime("%m/%d/%Y")

    with open(output_file, 'w') as fout:
        fout.write(f"Generated on {current_date}\n")
        fout.write(f"{len(overlaps)} Total Overlaps\n\n")
        for pair, count in overlaps:
            playlist1, playlist2 = pair
            songs = sorted(pair_songs.get(pair, []))
            songs_str = ", ".join(songs)
            fout.write(f"{count}: {playlist1} + {playlist2}:\n  {songs_str}\n\n")

    print(f"Wrote {len(overlaps)} playlist overlaps (with at least 4 common songs) to {output_file}")

if __name__ == "__main__":
    main()
