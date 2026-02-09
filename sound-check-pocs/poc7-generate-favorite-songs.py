from datetime import datetime
from pathlib import Path

# Define file paths
base_path = Path(__file__).parent / "personal_data"
saved_songs_file = base_path / "intersections" / "savedSongs.txt"
saved_in_top_songs_file = base_path / "intersections" / "savedSongsInTopSongs.txt"
playlist_frequency_file = base_path / "playlist-songs" / "mostFrequentPlaylistSongs.txt"
popularity_file = base_path / "saved-songs" / "songsOrderedByPopularity.txt"
top_100_file = base_path / "favorite-songs" / "my-top-100.txt"
output_file = base_path / "favorite-songs" / "generated-favorite-songs.txt"

# Parse saved songs
songs = {}
with open(saved_songs_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.rsplit(' | ', 2)
        if len(parts) == 3:
            song_name, artist, song_id = parts
            songs[song_id] = {
                'name': song_name,
                'artist': artist,
                'rank': None,
                'playlist_count': 0,
                'popularity': 0,
                'top_100_score': 0
            }

# Parse saved songs in top songs to get ranks
rank_counter = 1
max_rank = 0
with open(saved_in_top_songs_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        parts = line.rsplit(' | ', 2)
        if len(parts) == 3:
            song_name, artist, song_id = parts
            if song_id in songs:
                songs[song_id]['rank'] = rank_counter
                max_rank = rank_counter
                rank_counter += 1

# Assign default rank for songs not in top songs
default_rank = max_rank + 1
for song_id in songs:
    if songs[song_id]['rank'] is None:
        songs[song_id]['rank'] = default_rank

# Parse playlist frequency
with open(playlist_frequency_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Format: "5: Song Name | Artist | ID | Playlists: ..."
        parts = line.split(': ', 1)
        if len(parts) == 2:
            count = int(parts[0])
            rest = parts[1]
            song_parts = rest.split(' | ')
            if len(song_parts) >= 3:
                song_id = song_parts[2]
                if song_id in songs:
                    songs[song_id]['playlist_count'] = count

# Parse popularity
with open(popularity_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Format: "100: Song Name - Artist"
        parts = line.split(': ', 1)
        if len(parts) == 2:
            popularity = int(parts[0])
            song_info = parts[1]
            # Split by last ' - ' to separate song and artist
            song_artist_parts = song_info.rsplit(' - ', 1)
            if len(song_artist_parts) == 2:
                song_name, artist = song_artist_parts
                # Find matching song by name and artist
                for song_id in songs:
                    if (songs[song_id]['name'].lower() == song_name.lower() and
                        songs[song_id]['artist'].lower() == artist.lower()):
                        songs[song_id]['popularity'] = popularity
                        break

# Parse top 100 songs (match by song name and artist)
top_100_songs = {}  # Map of (song_name, artist) -> rank_position (1-based)
with open(top_100_file, 'r', encoding='utf-8') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Skip header line: "Top 100 Favorite Songs: MM/DD/YYYY"
        if line.startswith('Top 100 Favorite Songs:'):
            continue
        # Format: "#) Song Name | ARTIST"
        # Split by ") " to separate rank from song info
        if ') ' in line:
            rank_part, song_info = line.split(') ', 1)
            try:
                rank_position = int(rank_part)
            except ValueError:
                continue
            # Now parse the song info: "Song Name | ARTIST"
            parts = song_info.rsplit(' | ', 1)
            if len(parts) == 2:
                song_name = parts[0].lower()
                artist = parts[1].lower()
                top_100_songs[(song_name, artist)] = rank_position

# Mark songs in top 100 with appropriate score
for song_id in songs:
    song_name_lower = songs[song_id]['name'].lower()
    artist_lower = songs[song_id]['artist'].lower()
    key = (song_name_lower, artist_lower)
    
    if key in top_100_songs:
        rank_pos = top_100_songs[key]
        if rank_pos <= 50:
            songs[song_id]['top_100_score'] = 100
        else:
            songs[song_id]['top_100_score'] = 50
    else:
        songs[song_id]['top_100_score'] = 0

# Calculate scores
scored_songs = []
for song_id, song_data in songs.items():
    # Calculate rank score (50% weight)
    # 0 if not in top songs (rank = default_rank), scale from 0 to 100
    if song_data['rank'] == default_rank:
        rank_score = 0
    else:
        # 1 (top) -> 100, default_rank (bottom) -> 1
        # Normalize: (rank - 1) / (default_rank - 2)
        if default_rank > 1:
            rank_score = ((default_rank - song_data['rank']) / (default_rank - 1)) * 100
        else:
            rank_score = 100
    
    # Calculate playlist frequency score (40% weight)
    # 0->0, 1->20, 2->40, 3->60, 4->80, 5+->100
    playlist_score_map = {0: 0, 1: 20, 2: 40, 3: 60, 4: 80}
    playlist_score = playlist_score_map.get(song_data['playlist_count'], 100)
    
    # Calculate top 100 score (10% weight)
    # First 50 songs: 100, remaining songs: 50, not on list: 0
    top_100_score = song_data['top_100_score']
    
    # Final score calculation
    final_score = (rank_score * 0.5) + (playlist_score * 0.3) + (top_100_score * 0.2)
    final_score = round(final_score, 2)
    
    scored_songs.append({
        'id': song_id,
        'name': song_data['name'],
        'artist': song_data['artist'],
        'score': final_score,
        'rank_score': round(rank_score, 2),
        'playlist_score': playlist_score,
        'top_100_score': top_100_score
    })

# Sort by score descending
scored_songs.sort(key=lambda x: x['score'], reverse=True)

# Write output
with open(output_file, 'w', encoding='utf-8') as f:
    # First line: "Generated on MM/DD/YYYY"
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Generated on {current_date}\n")
    
    # Each line: "Score: Song | Artist | ID | TopSavedScore | PlaylistFrequencyScore | MyTop100Score"
    for song in scored_songs:
        line = f"{song['score']}: {song['name']} | {song['artist']} | {song['id']} | {song['rank_score']} | {song['playlist_score']} | MT{song['top_100_score']}\n"
        f.write(line)

print(f"Generated favorite songs file: {output_file}")
print(f"Total songs processed: {len(scored_songs)}")
print(f"Top 5 songs:")
for i, song in enumerate(scored_songs[:5], 1):
    print(f"{i}. {song['score']}: {song['name']} | {song['artist']}")
