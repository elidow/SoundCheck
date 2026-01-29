# Eli Dow
# January 2026
# SoundCheck POC - List Playlist Overlaps (at least 4 common songs)

import os
from collections import Counter
from itertools import combinations
from dotenv import load_dotenv

load_dotenv()
filePath = os.getenv("FILE_PATH") or ""

input_file = os.path.join(filePath, 'playlist-songs/mostFrequentPlaylistSongs.txt')
output_file = os.path.join(filePath, 'playlistOverlaps.txt')

def main():
    pair_counter = Counter()

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
            # Generate all unique pairs
            for pair in combinations(playlists, 2):
                # Sort the pair to make it unordered
                sorted_pair = tuple(sorted(pair))
                pair_counter[sorted_pair] += 1

    # Filter for overlaps with at least 4 common songs and sort by count descending
    overlaps = [(pair, count) for pair, count in pair_counter.items() if count >= 4]
    overlaps.sort(key=lambda x: -x[1])

    with open(output_file, 'w') as fout:
        fout.write("Generated on 01/29/2026\n")
        for pair, count in overlaps:
            playlist1, playlist2 = pair
            fout.write(f"{count}: {playlist1} + {playlist2}\n")

    print(f"Wrote {len(overlaps)} playlist overlaps (with at least 4 common songs) to {output_file}")

if __name__ == "__main__":
    main()
