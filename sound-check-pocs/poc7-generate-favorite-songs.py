from datetime import datetime
from pathlib import Path

# Define file paths
base_path = Path(__file__).parent / "personal_data"


def normalize_album_key(album_name, artist_name):
    return (album_name.strip().lower(), artist_name.strip().lower())


def parse_song_line_with_album(line):
    parts = [p.strip() for p in line.rsplit(' | ', 3)]
    if len(parts) == 4:
        return parts[0], parts[1], parts[2], parts[3]
    if len(parts) == 3:
        return parts[0], parts[1], "", parts[2]
    return None, None, None, None

print("Generating favorite songs file...")

saved_songs_file = base_path / "intersections" / "savedSongs.txt"
saved_in_top_songs_file = base_path / "intersections" / "savedSongsInTopSongs.txt"
saved_in_playlists_file = base_path / "intersections" / "savedSongsInPlaylists.txt"
top_100_file = base_path / "favorites" / "my-top-100-songs.txt"
favorite_songs_file = base_path / "favorites" / "generated-favorite-songs.txt"

# Parse saved songs
songs = {}
with open(saved_songs_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        song_name, artist, album, song_id = parse_song_line_with_album(line)
        if song_id:
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
        song_name, artist, album, song_id = parse_song_line_with_album(line)
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
with open(saved_in_playlists_file, 'r', encoding='utf-8') as f:
    next(f)  # Skip generated date line
    for line in f:
        line = line.strip()
        if not line:
            continue
        # Format: "5: Song Name | Artist | Album | ID | Playlists: ..."
        parts = line.split(': ', 1)
        if len(parts) == 2:
            count = int(parts[0])
            rest = parts[1]
            song_parts = rest.split(' | ')
            if len(song_parts) >= 4:
                song_id = song_parts[3]
            elif len(song_parts) >= 3:
                song_id = song_parts[2]
            else:
                continue
            if song_id in songs:
                songs[song_id]['playlist_count'] = count

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
        if ')' in line:
            rank_part, song_info = line.split(')', 1)
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

# Favorite songs scoring and output format
# - rank_score: 50% weight. Calculated from savedSongsInTopSongs position.
#   Formula: ((default_rank - rank) / (default_rank - 1)) * 100
#   Top-ranked saved song => near 100, missing from top list => 0.
# - playlist_score: 30% weight. Based on how many playlists the saved song appears in.
#   0 => 0, 1 => 20, 2 => 40, 3 => 60, 4 => 80, 5+ => 100.
# - top_100_score: 20% weight. Based on the my-top-100-songs list.
#   Rank <= 50 => 100, rank 51-100 => 50, not present => 0.
# - final score = rank_score * 0.5 + playlist_score * 0.3 + top_100_score * 0.2
# Output row order:
#   Generated on MM/DD/YYYY
#   <score>: <song name> | <artist> | <id> | <rank_score> | <playlist_score> | MT<top_100_score>
#     - score: weighted total used for sorting.
#     - MT prefix indicates My Top 100 score contribution.
#     - id is the Spotify track ID.
#     - rank_score and playlist_score are the normalized sub-scores.

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
with open(favorite_songs_file, 'w', encoding='utf-8') as f:
    # First line: "Generated on MM/DD/YYYY"
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Generated on {current_date}\n")
    
    # Each line: "Score: Song | Artist | ID | TopSavedScore | PlaylistFrequencyScore | MyTop100Score"
    for song in scored_songs:
        line = f"{song['score']}: {song['name']} | {song['artist']} | {song['id']} | {song['rank_score']} | {song['playlist_score']} | MT{song['top_100_score']}\n"
        f.write(line)
print(f"Generated favorite songs file: {favorite_songs_file}\n")


# Refine top 60 albums from saved songs
print("Refining top 60 albums file...")
saved_data_albums_file = base_path / "saved-data" / "albums" / "mostFrequentAlbumsInSavedSongs.txt"
top_60_albums_file = base_path / "favorites" / "my-top-60-albums.txt"

# First, build a lookup of albums -> artist, counts, and album id from saved data
album_data = {}
if saved_data_albums_file.exists():
    with open(saved_data_albums_file, 'r', encoding='utf-8') as f:
        next(f)  # Skip header with date
        for line in f:
            line = line.strip()
            if not line:
                continue
            # Format: "count | Album | Artist | ID"
            try:
                parts = line.split(' | ')
                if len(parts) >= 4:
                    count = int(parts[0])
                    album_name = parts[1].strip()
                    album_artist = parts[2].strip()
                    album_id = parts[3].strip()
                    key = normalize_album_key(album_name, album_artist)
                    # keep the first occurrence for duplicate album keys
                    if key not in album_data:
                        album_data[key] = {
                            'count': count,
                            'id': album_id,
                            'name': album_name,
                            'artist': album_artist
                        }
            except (ValueError, IndexError):
                continue

# Now read existing file and update album counts while preserving order
existing_album_entries = []
top_60_rank_by_key = {}
if top_60_albums_file.exists():
    with open(top_60_albums_file, 'r', encoding='utf-8') as f:
        next(f)  # Skip header
        for line in f:
            line = line.strip()
            if not line or line.startswith('Top'):
                continue
            try:
                # Format: "rank) Album | Artist | count" or "rank)Album | Artist | count"
                rank_part, rest = line.split(')', 1)
                rank = int(rank_part)
                rest = rest.strip()
                parts = rest.split(' | ')
                if len(parts) >= 2:
                    album_name = parts[0].strip()
                    artist_name = parts[1].strip()
                    key = normalize_album_key(album_name, artist_name)
                    if key in album_data:
                        count = album_data[key]['count']
                    else:
                        count = "?"
                    top_60_rank_by_key[key] = rank
                    existing_album_entries.append((rank, album_name, artist_name, count))
            except (ValueError, IndexError):
                continue

# Write back with preserved order
with open(top_60_albums_file, 'w', encoding='utf-8') as f:
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Top 60 Favorite Albums: {current_date}\n")
    for rank, album, artist, count in existing_album_entries:
        f.write(f"{rank}) {album} | {artist} | {count}\n")

# Generate favorite albums scoring file
print("Generating favorite albums file...")
favorite_albums_file = base_path / "favorites" / "generated-favorite-albums.txt"
playlist_albums_file = base_path / "playlist-songs" / "mostFrequentPlaylistSongAlbums.txt"
saved_album_percentage_file = base_path / "saved-data" / "albums" / "savedAlbumsOrderedBySavedTracks.txt"
saved_top_songs_file = base_path / "intersections" / "savedSongsInTopSongs.txt"

# Favorite albums scoring and output format
# - top_song_score: 40% weight. Based on how many saved songs from this album are in savedSongsInTopSongs.
#   Formula: min(top_song_count * 10 + 2, 100)
# - playlist_song_score: 10% weight. Based on how often this album appears across playlists.
#   Formula: min(playlist_count * 5, 100)
# - track_number_score: 15% weight. Based on the total saved track count for the album.
#   Formula: min(saved_track_count * 10 + 2, 100)
# - saved_track_pct_score: 15% weight. Taken directly from savedAlbumsOrderedBySavedTracks percent values.
# - my_top_list_score: 20% weight. Based on my-top-60-albums rank.
#   <= 30 => 100, <= 60 => 50, missing => 0.
# - total_score = (top_song_score * 0.4) + (playlist_song_score * 0.1) + (track_number_score * 0.15) + (saved_track_pct_score * 0.15) + (my_top_list_score * 0.2)
# Output row order:
#   Generated on MM/DD/YYYY
#   <total_score>: <album> | <artist> | <id> | <top_song_score> | <playlist_song_score> | <track_number_score> | <saved_track_pct_score> | MT<my_top_list_score>

# Parse saved albums percentage data
saved_album_percentage = {}
if saved_album_percentage_file.exists():
    with open(saved_album_percentage_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(' | ')
            if len(parts) >= 5:
                percent_str = parts[0].strip().rstrip('%')
                album_name = parts[2].strip()
                album_artist = parts[3].strip()
                try:
                    # store as whole number (cut decimal)
                    saved_album_percentage[normalize_album_key(album_name, album_artist)] = int(float(percent_str))
                except ValueError:
                    continue

# Parse playlist album counts
playlist_album_counts = {}
if playlist_albums_file.exists():
    with open(playlist_albums_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(': ', 1)
            if len(parts) != 2:
                continue
            try:
                count = int(parts[0])
            except ValueError:
                continue
            rest = parts[1]
            album_parts = rest.split(' | ')
            if len(album_parts) >= 3:
                album_name = album_parts[0].strip()
                album_artist = album_parts[1].strip()
                playlist_album_counts[normalize_album_key(album_name, album_artist)] = count

# Parse saved songs in top songs to get album counts
saved_top_album_counts = {}
if saved_top_songs_file.exists():
    with open(saved_top_songs_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            song_name, artist, album, song_id = parse_song_line_with_album(line)
            if album and artist:
                saved_top_album_counts[normalize_album_key(album, artist)] = saved_top_album_counts.get(normalize_album_key(album, artist), 0) + 1

# Compose favorite album entries
favorite_albums = []
for key, data in album_data.items():
    if data['count'] < 3:
        continue

    top_song_count = saved_top_album_counts.get(key, 0)
    top_song_score = min(top_song_count * 10 + 2, 100)

    playlist_count = playlist_album_counts.get(key, 0)
    playlist_song_score = min(playlist_count * 5, 100)

    track_number_score = min(data['count'] * 10 + 2, 100)
    saved_track_pct_score = saved_album_percentage.get(key, 0.0)

    rank = top_60_rank_by_key.get(key)
    if rank is not None:
        if rank <= 30:
            my_top_list_score = 100
        elif rank <= 60:
            my_top_list_score = 50
        else:
            my_top_list_score = 0
    else:
        my_top_list_score = 0

    total_score = round(
        (top_song_score * 0.4)
        + (playlist_song_score * 0.1)
        + (track_number_score * 0.15)
        + (saved_track_pct_score * 0.15)
        + (my_top_list_score * 0.2),
        2
    )

    favorite_albums.append({
        'id': data['id'],
        'name': data['name'],
        'artist': data['artist'],
        'total_score': total_score,
        'top_song_score': top_song_score,
        'playlist_song_score': playlist_song_score,
        'track_number_score': track_number_score,
        'saved_track_pct_score': saved_track_pct_score,
        'my_top_list_score': my_top_list_score,
    })

favorite_albums.sort(key=lambda x: x['total_score'], reverse=True)

with open(favorite_albums_file, 'w', encoding='utf-8') as f:
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Generated on {current_date}\n")
    for album in favorite_albums:
        f.write(
            f"{album['total_score']:.2f}: {album['name']} | {album['artist']} | {album['id']} | "
            f"{album['top_song_score']} | {album['playlist_song_score']} | {album['track_number_score']} | "
            f"{int(album['saved_track_pct_score'])} | MT{album['my_top_list_score']}\n"
        )

print(f"Generated favorite albums file: {favorite_albums_file}\n")

# --- Generate favorite artists file ---
favorite_artists_file = base_path / "favorites" / "generated-favorite-artists.txt"
saved_data_artists_file = base_path / "saved-data" / "artists" / "mostFrequentArtistsInSavedSongs.txt"
playlist_artists_file = base_path / "playlist-songs" / "mostFrequentPlaylistSongArtists.txt"
top_40_artists_file = base_path / "favorites" / "my-top-40-artists.txt"
saved_top_songs_file = base_path / "intersections" / "savedSongsInTopSongs.txt"

# Favorite artists scoring and output format
# - top_song_score: 40% weight. Based on the number of saved top songs attributed to the artist.
#   Formula: min(top_count * 2 + 2, 100)
# - playlist_score: 20% weight. Based on playlist occurrence count for the artist.
#   Formula: min(playlist_count * 2, 100)
# - saved_score: 20% weight. Based on the saved songs count for the artist.
#   Formula: min(saved_count * 2, 100)
# - my_top_score: 20% weight. Based on my-top-40-artists rank.
#   <= 20 => 100, <= 40 => 50, missing => 0.
# - total_score = (top_song_score * 0.4) + (playlist_score * 0.2) + (saved_score * 0.2) + (my_top_score * 0.2)
# Output row order:
#   Generated on MM/DD/YYYY
#   <total_score>: <artist> | <id> | <top_song_score> | <playlist_score> | <saved_score> | MT<my_top_score>

# Refine top 40 artists file from saved-data (preserve existing order)
print(f"Refining top 40 artists file...")
artist_counts = {}
if saved_data_artists_file.exists():
    with open(saved_data_artists_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                parts = line.split(' | ')
                if len(parts) >= 2:
                    count = int(parts[0])
                    artist_name = parts[1].strip()
                    artist_counts[artist_name] = count
            except (ValueError, IndexError):
                continue

# Read existing top-40 file and update counts while preserving order
existing_entries = []
if top_40_artists_file.exists():
    with open(top_40_artists_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line or line.startswith('Top'):
                continue
            try:
                rank_part, rest = line.split(')', 1)
                rank = int(rank_part)
                rest = rest.strip()
                parts = rest.split(' | ')
                if len(parts) >= 1:
                    artist_name = parts[0].strip()
                    count = artist_counts.get(artist_name, "?")
                    existing_entries.append((rank, artist_name, count))
            except (ValueError, IndexError):
                continue

with open(top_40_artists_file, 'w', encoding='utf-8') as f:
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Top 40 Favorite Artists: {current_date}\n")
    for rank, artist, count in existing_entries:
        f.write(f"{rank}) {artist} | {count}\n")

print("Generating favorite artists file...")

# Parse saved-data artists counts
artist_data = {}
if saved_data_artists_file.exists():
    with open(saved_data_artists_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(' | ')
            try:
                if len(parts) >= 3:
                    count = int(parts[0])
                    name = parts[1].strip()
                    aid = parts[2].strip()
                    artist_data[name.lower()] = {'count': count, 'id': aid, 'name': name}
            except (ValueError, IndexError):
                continue

# Parse savedSongsInTopSongs to count artist appearances
top_song_artist_counts = {}
if saved_top_songs_file.exists():
    with open(saved_top_songs_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = [p.strip() for p in line.rsplit(' | ', 3)]
            if len(parts) >= 4:
                # parts: song | artist | album | id
                artist_name = parts[1]
                key = artist_name.lower()
                top_song_artist_counts[key] = top_song_artist_counts.get(key, 0) + 1

# Parse playlist artist counts
playlist_artist_counts = {}
if playlist_artists_file.exists():
    with open(playlist_artists_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(': ', 1)
            if len(parts) != 2:
                continue
            try:
                count = int(parts[0])
            except ValueError:
                continue
            rest = parts[1]
            artist_parts = rest.split(' | ')
            if len(artist_parts) >= 1:
                artist_name = artist_parts[0].strip()
                playlist_artist_counts[artist_name.lower()] = count

# Parse my-top-40-artists ranks
top40_rank = {}
if top_40_artists_file.exists():
    with open(top_40_artists_file, 'r', encoding='utf-8') as f:
        next(f)
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                rank_part, rest = line.split(')', 1)
                rank = int(rank_part)
                name = rest.split(' | ')[0].strip()
                top40_rank[name.lower()] = rank
            except Exception:
                continue

# Compose favorite artist entries
favorite_artists = []
for name_lower, info in artist_data.items():
    saved_count = info.get('count', 0)
    if saved_count < 5:
        continue

    top_count = top_song_artist_counts.get(name_lower, 0)
    top_song_score = min(top_count * 2 + 2, 100)

    playlist_count = playlist_artist_counts.get(name_lower, 0)
    playlist_score = min(playlist_count * 2, 100)

    saved_score = min(saved_count * 2, 100)

    rank = top40_rank.get(name_lower)
    if rank is not None:
        if rank <= 20:
            my_top_score = 100
        elif rank <= 40:
            my_top_score = 50
        else:
            my_top_score = 0
    else:
        my_top_score = 0

    # Compute weighted total: 40% top songs, 20% playlists, 20% saved, 20% my-top
    total_score = round((top_song_score * 0.4) + (playlist_score * 0.2) + (saved_score * 0.2) + (my_top_score * 0.2), 2)

    # Include rank for tie-breaker (lower is better); missing rank -> large value
    rank_val = top40_rank.get(name_lower, 9999)

    favorite_artists.append({
        'name': info['name'],
        'id': info.get('id', ''),
        'total_score': total_score,
        'top_song_score': top_song_score,
        'playlist_score': playlist_score,
        'saved_score': saved_score,
        'my_top_score': my_top_score,
        'rank': rank_val
    })

favorite_artists.sort(key=lambda x: (-x['total_score'], x.get('rank', 9999)))

with open(favorite_artists_file, 'w', encoding='utf-8') as f:
    current_date = datetime.now().strftime("%m/%d/%Y")
    f.write(f"Generated on {current_date}\n")
    for a in favorite_artists:
        f.write(f"{a['total_score']:.2f}: {a['name']} | {a['id']} | {a['top_song_score']} | {a['playlist_score']} | {a['saved_score']} | MT{a['my_top_score']}\n")

print(f"Generated favorite artists file: {favorite_artists_file}\n")

# Summary: print Top 5 Albums and Top 5 Artists (with spacing)
print(f"Top 5 songs:")
for i, song in enumerate(scored_songs[:5], 1):
    print(f"{i}. {song['score']}: {song['name']} | {song['artist']}")

print("\n\nTop 5 Albums:")
for i, alb in enumerate(favorite_albums[:5], 1):
    print(f"{i}. {alb['total_score']:.2f}: {alb['name']} | {alb['artist']}")

print("\n\nTop 5 Artists:")
for i, a in enumerate(favorite_artists[:5], 1):
    print(f"{i}. {a['total_score']:.2f}: {a['name']}")