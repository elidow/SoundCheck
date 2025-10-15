# Eli Dow
# January 2025
# MySPStats POC in Python

from datetime import datetime
from dateutil.relativedelta import relativedelta
import time
from spotify_web_api import SpotifyWebApi

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
        if startDate < dateAdded[:9] and dateAdded[:9] <= endDate:
            outdated += 1
    percentage = outdated / len(playlistSongs)
    return percentage

# Main function
def main():
    start_time = time.time()
    
    # initialize Spotify API
    scope = "playlist-read-private playlist-read-collaborative"
    api = SpotifyWebApi(scope=scope)
    code_verifier = api.generate_code_verifier()
    code_challenge = api.generate_code_challenge(code_verifier)
    authorization_url = api.get_authorization_url(code_challenge)
    print("Go to this URL and authorize the app:\n", authorization_url)
    authorization_code = input("Enter the code from the redirect URL: ").strip()
    api.get_token_pkce(authorization_code, code_verifier)

    # Fetch playlists
    playlists = api.get_playlists()
    playlistStats = []

    # Date calculations
    today = datetime.now()
    sixMonthsAgo = today - relativedelta(months=6)
    twoYearsAgo = today - relativedelta(years=2)
    todayFormatted = today.strftime("%Y-%m-%d")
    sixMonthsAgoFormatted = sixMonthsAgo.strftime("%Y-%m-%d")
    twoYearsAgoFormatted = twoYearsAgo.strftime("%Y-%m-%d")

    # Calculate stats for each playlist based on songs
    for playlist in playlists:
        title = playlist['name']
        tracks = playlist['tracks']['total']
        print(f"Name: {title}, Tracks: {tracks}")
        id = playlist["external_urls"]["spotify"][34:]
        print(f"Id: {id}")

        # Fetch full playlist data
        playlist_data = api.get_playlist(id)

        # Calculate percentages
        outdatedPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, "2000-01-01", twoYearsAgoFormatted), 4)) * 100
        recentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, sixMonthsAgoFormatted, todayFormatted), 4)) * 100
        somewhatRecentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist_data, twoYearsAgoFormatted, sixMonthsAgoFormatted), 4)) * 100
        playlistStats.append(PlaylistStats(title, tracks, outdatedPercentage, recentPercentage, somewhatRecentPercentage))

    # Sort and display playlists by different criteria
    sortedByTracks = sorted(playlistStats, key=lambda playlist: playlist.tracks, reverse=True)
    sortedByOutdated = sorted(playlistStats, key=lambda playlist: playlist.outdated, reverse=True)
    sortedByRecent = sorted(playlistStats, key=lambda playlist: playlist.recent, reverse=True)
    sortedBySomewhatRecent = sorted(playlistStats, key=lambda playlist: playlist.somewhat_recent, reverse=True)

    print("\n\nPlaylists Ordered by # of Tracks: ")
    for i in range(len(sortedByTracks)):
        print(sortedByTracks[i].title + ": ", end="")
        print(sortedByTracks[i].tracks, end="\n")

    print("\nPlaylists Ordered by Percentage of >2 Years old: ")
    for i in range(len(sortedByOutdated)):
        print(sortedByOutdated[i].title + ": ", end="")
        print('%.3f' % round(sortedByOutdated[i].outdated, 3), end="%\n")

    print("\nPlaylists Ordered by Percentage of <6 months old: ")
    for i in range(len(sortedByRecent)):
        print(sortedByRecent[i].title + ": ", end="")
        print('%.3f' % round(sortedByRecent[i].recent, 3), end="%\n")

    print("\nPlaylists Ordered by Percentage of In Between: ")
    for i in range(len(sortedBySomewhatRecent)):
        print(sortedBySomewhatRecent[i].title + ": ", end="")
        print('%.3f' % round(sortedBySomewhatRecent[i].somewhat_recent, 3), end="%\n")

    end_time = time.time()
    total_time = end_time - start_time
    print(f"Total time: {total_time} seconds")

if __name__ == "__main__":
    main()