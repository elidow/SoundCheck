# Eli Dow
# December 2025
# SoundCheck POC - List Top 100 Playlist Overlaps

import os
from collections import Counter
from itertools import combinations
from dotenv import load_dotenv

load_dotenv()
filePath = os.getenv("FILE_PATH") or ""

input_file = os.path.join(filePath, 'mostFrequentPlaylistSongs.txt')
output_file = os.path.join(filePath, 'top100PlaylistOverlaps.txt')

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

    # Get top 100
    top_100 = pair_counter.most_common(100)

    with open(output_file, 'w') as fout:
        for pair, count in top_100:
            playlist1, playlist2 = pair
            fout.write(f"{count}: {playlist1} + {playlist2}\n")

    print(f"Wrote top 100 playlist overlaps to {output_file}")

if __name__ == "__main__":
    main()