# Eli Dow
# January 2026
# SoundCheck POC - Generate comprehensive playlist song statistics

import os
import time
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
from spotify_web_api import SpotifyWebApi

load_dotenv()
filePath = os.getenv("FILE_PATH")

# Class for Playlist Stats
class PlaylistStats:
    def __init__(self, title, tracks, outdated, recent, somewhat_recent):
        self.title = title
        self.tracks = tracks
        self.outdated = outdated
        self.recent = recent
        self.somewhat_recent = somewhat_recent

# Calculate percentage of songs added in a date range
def calcPlaylistSongsAddedInRangePercentage(playlist, startDate, endDate):
    playlistSongs = playlist["tracks"]["items"]
    outdated = 0
    for i in range(len(playlistSongs)):
        dateAdded = playlistSongs[i]["added_at"]
        if startDate < dateAdded[:10] and dateAdded[:10] <= endDate:
            outdated += 1
    percentage = outdated / len(playlistSongs) if len(playlistSongs) > 0 else 0
    return percentage

def main():
    start_time = time.time()
    
    # Initialize Spotify API
    scope = "playlist-read-private playlist-read-collaborative"
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    # Fetch playlists
    print("Fetching playlists...")
    playlists = api.get_playlists()
    print(f"Found {len(playlists)} playlists.")
    
    playlistStats = []
    
    # Date calculations
    today = datetime.now()
    sixMonthsAgo = today - relativedelta(months=6)
    twoYearsAgo = today - relativedelta(years=2)
    todayFormatted = today.strftime("%Y-%m-%d")
    sixMonthsAgoFormatted = sixMonthsAgo.strftime("%Y-%m-%d")
    twoYearsAgoFormatted = twoYearsAgo.strftime("%Y-%m-%d")

    # Data structures for frequency analysis
    song_freq = {}
    artist_freq = {}
    album_freq = {}

    # Calculate stats for each playlist based on songs
    print("Processing playlists...")
    for playlist in playlists:
        title = playlist['name']
        tracks = playlist['tracks']['total']
        print(f"Processing: {title}, Tracks: {tracks}")
        playlist_id = playlist["id"]

        # Fetch full playlist data
        playlist_data = api.get_playlist(playlist_id)

        # Calculate percentages for basic stats
        outdatedPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, "2000-01-01", twoYearsAgoFormatted), 4)) * 100
        recentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, sixMonthsAgoFormatted, todayFormatted), 4)) * 100
        somewhatRecentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, twoYearsAgoFormatted, sixMonthsAgoFormatted), 4)) * 100
        playlistStats.append(PlaylistStats(title, tracks, outdatedPercentage, recentPercentage, somewhatRecentPercentage))

        # Process songs for frequency analysis
        for item in playlist_data["tracks"]["items"]:
            track = item.get("track")
            if not track or not track.get("id"):
                continue
            
            # Song frequency
            song_id = track["id"]
            song_name = track["name"]
            artist_name = track["artists"][0]["name"] if track["artists"] else "Unknown"
            artist_id = track["artists"][0]["id"] if track["artists"] else "Unknown"
            album_name = track["album"]["name"] if track.get("album") else "Unknown"
            album_id = track["album"]["id"] if track.get("album") else "Unknown"
            
            if song_id in song_freq:
                song_freq[song_id]["count"] += 1
                song_freq[song_id]["playlists"].add(title)
            else:
                song_freq[song_id] = {
                    "count": 1,
                    "name": song_name,
                    "artist": artist_name,
                    "id": song_id,
                    "playlists": set([title])
                }
            
            # Artist frequency (by artist ID)
            artist_key = (artist_id, artist_name)
            if artist_key in artist_freq:
                artist_freq[artist_key]["count"] += 1
                if title not in artist_freq[artist_key]["playlists"]:
                    artist_freq[artist_key]["playlists"][title] = 0
                artist_freq[artist_key]["playlists"][title] += 1
            else:
                artist_freq[artist_key] = {
                    "count": 1,
                    "id": artist_id,
                    "name": artist_name,
                    "playlists": {title: 1}
                }
            
            # Album frequency (by album ID)
            album_key = (album_id, album_name)
            if album_key in album_freq:
                album_freq[album_key]["count"] += 1
                if title not in album_freq[album_key]["playlists"]:
                    album_freq[album_key]["playlists"][title] = 0
                album_freq[album_key]["playlists"][title] += 1
            else:
                album_freq[album_key] = {
                    "count": 1,
                    "id": album_id,
                    "name": album_name,
                    "playlists": {title: 1}
                }

    # Write basic playlist stats
    print("Writing basic playlist stats...")
    sortedByTracks = sorted(playlistStats, key=lambda playlist: playlist.tracks, reverse=True)
    sortedByOutdated = sorted(playlistStats, key=lambda playlist: playlist.outdated, reverse=True)
    sortedByRecent = sorted(playlistStats, key=lambda playlist: playlist.recent, reverse=True)
    sortedBySomewhatRecent = sorted(playlistStats, key=lambda playlist: playlist.somewhat_recent, reverse=True)

    with open(filePath + 'playlist-songs/basicPlaylistStats.txt', 'w') as file:
        file.write("Playlists Ordered by # of Tracks:\n")
        for playlist in sortedByTracks:
            file.write(f"{playlist.title}: {playlist.tracks}\n")
        
        file.write("\nPlaylists Ordered by Percentage of >2 Years old:\n")
        for playlist in sortedByOutdated:
            file.write(f"{playlist.title}: {playlist.outdated:.3f}%\n")
        
        file.write("\nPlaylists Ordered by Percentage of <6 months old:\n")
        for playlist in sortedByRecent:
            file.write(f"{playlist.title}: {playlist.recent:.3f}%\n")
        
        file.write("\nPlaylists Ordered by Percentage of In Between:\n")
        for playlist in sortedBySomewhatRecent:
            file.write(f"{playlist.title}: {playlist.somewhat_recent:.3f}%\n")

    # Write most frequent songs
    print("Writing most frequent songs...")
    song_freq_list = list(song_freq.values())
    song_freq_list.sort(key=lambda x: (-x["count"], x["name"]))

    with open(filePath + 'playlist-songs/mostFrequentPlaylistSongs.txt', 'w') as file:
        for entry in song_freq_list:
            playlists_str = ", ".join(sorted(entry["playlists"]))
            file.write(f"{entry['count']}: {entry['name']} | {entry['artist']} | {entry['id']} | Playlists: {playlists_str}\n")

    # Write most frequent artists
    print("Writing most frequent artists...")
    artist_freq_list = list(artist_freq.values())
    artist_freq_list.sort(key=lambda x: (-x["count"], x["name"]))

    with open(filePath + 'playlist-songs/mostFrequentPlaylistSongArtists.txt', 'w') as file:
        for entry in artist_freq_list:
            playlists_str = ", ".join([f"{name} ({count})" for name, count in sorted(entry["playlists"].items(), key=lambda x: -x[1])])
            file.write(f"{entry['count']}: {entry['name']} | {entry['id']} | Playlists: {playlists_str}\n")

    # Write most frequent albums
    print("Writing most frequent albums...")
    album_freq_list = list(album_freq.values())
    album_freq_list.sort(key=lambda x: (-x["count"], x["name"]))

    with open(filePath + 'playlist-songs/mostFrequentPlaylistSongAlbums.txt', 'w') as file:
        for entry in album_freq_list:
            playlists_str = ", ".join([f"{name} ({count})" for name, count in sorted(entry["playlists"].items(), key=lambda x: -x[1])])
            file.write(f"{entry['count']}: {entry['name']} | {entry['id']} | Playlists: {playlists_str}\n")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"\nComplete!")
    print(f"Wrote {len(song_freq_list)} unique songs to mostFrequentPlaylistSongs.txt")
    print(f"Wrote {len(artist_freq_list)} unique artists to mostFrequentPlaylistSongArtists.txt")
    print(f"Wrote {len(album_freq_list)} unique albums to mostFrequentPlaylistSongAlbums.txt")
    print(f"Total time: {total_time:.2f} seconds")

if __name__ == "__main__":
    main()
