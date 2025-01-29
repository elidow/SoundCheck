# Eli Dow
# January 2025
# MySPStats POC

import base64
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta # type: ignore
from dotenv import load_dotenv
import os
import requests
import urllib.parse
import time

load_dotenv()

clientId = os.getenv("CLIENT_ID")
clientSecret = os.getenv("CLIENT_SECRET")
redirectUri = os.getenv("REDIRECT_URI")
scope = "playlist-read-private playlist-read-collaborative"

# TODO: As a devloper, I want to find a way to get the authroization code on load
# Right now you have to click on the authorization url below and grab the code from the URL every time. It is a one time use and is very tedious
# https://accounts.spotify.com/authorize?client_id=...
authorizationCode = os.getenv("AUTHORIZATION_CODE")

authorizationUrl = (
    "https://accounts.spotify.com/authorize?"
    + urllib.parse.urlencode({
        "client_id": clientId,
        "response_type": "code",
        "redirect_uri": redirectUri,
        "scope": scope
    })
)

print(authorizationUrl)

# Given a client id, secret, redirect uri, and authroization code, it retrieves a valid user access token to use the Spotify Web API for that user
def getToken(clientId, clientSecret, redirectUri, authorizationCode):
    url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": "Basic " + base64.b64encode(f"{clientId}:{clientSecret}".encode()).decode(),
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "authorization_code",
        "code": authorizationCode,
        "redirect_uri": redirectUri
    }
    tokenResponse = requests.post(url, headers=headers, data=data)
    if tokenResponse.status_code != 200:
        raise Exception(f"Failed to get access token: {tokenResponse.status_code}, {tokenResponse.text}")
    
    return tokenResponse.json()['access_token']

# Given a valid user access token, requests the Spotify Web API to retrieve the user's playlists data
def getPlaylists(accessToken):
    playlists = []
    url = "https://api.spotify.com/v1/me/playlists"
    headers = {
        "Authorization": "Bearer " + accessToken
    }
    params = {
        "limit": 50,
        "offset": 0
    }

    # retrieves playlist data in chunks
    while url:
        playlistResponse = requests.get(url, headers=headers, params=params)

        if playlistResponse.status_code != 200:
            raise Exception(f"Failed to get playlists: {playlistResponse.status_code}, {playlistResponse.text}")
    
        data = playlistResponse.json()
        filtered = [playlist for playlist in data['items'] 
                              if playlist['owner']['display_name'] == "eliasjohnsondow"]

        playlists.extend(filtered)

        url = data.get('next')

    return playlists

# Given a valid user access token and a valid playlist id, requests the Spotify Web API to retrieve the user's playlist data
def getPlaylist(accessToken, playlistId):
    playlistUrl = "https://api.spotify.com/v1/playlists/" + playlistId
    headers = {
        "Authorization": "Bearer " + accessToken,
    }

    playlistResponse = requests.get(playlistUrl, headers=headers)
    if playlistResponse.status_code != 200:
            raise Exception(f"Failed to get playlists: {playlistResponse.status_code}, {playlistResponse.text}")

    return playlistResponse.json()

# Given a playlist, a start date, and end date, it returns the percentage of songs that were added between start date and end date (]
def calcPlaylistSongsAddedInRangePercentage(playlist, startDate, endDate):
    playlistSongs = playlist["tracks"]["items"]
    outdated = 0
    for i in range(len(playlistSongs)):
        dateAdded = playlistSongs[i]["added_at"]
        if startDate < dateAdded[:9] and dateAdded[:9] <= endDate:
            outdated += 1

    percentage = outdated / len(playlistSongs)
    return percentage

# class for Playlist Stats
class PlaylistStats:
    def __init__(self, title, tracks, outdated, recent, somewhat_recent):
        self.title = title
        self.tracks = tracks
        self.outdated = outdated
        self.recent = recent
        self.somewhat_recent = somewhat_recent


### Main Code ###

# start time
start_time = time.time()

# get access token
accessToken = getToken(clientId, clientSecret, redirectUri, authorizationCode)

# get playlists
playlists = getPlaylists(accessToken)
# print(len(playlists))
# print("")

# initialize playlistStats
playlistStats = []

# Get today's date
today = datetime.now()

# Calculate the date 6 months ago and 2 years ago
sixMonthsAgo = today - relativedelta(months=6)
twoYearsAgo = today - relativedelta(years=2)

# Format the dates as "YYYY-MM-DD"
todayFormatted = today.strftime("%Y-%m-%d")
sixMonthsAgoFormatted = sixMonthsAgo.strftime("%Y-%m-%d")
twoYearsAgoFormatted = twoYearsAgo.strftime("%Y-%m-%d")

# calculating stats per playlist
for playlist in playlists:
    
    # retrieve and print title and tracks
    title = playlist['name']
    tracks = playlist['tracks']['total']
    # print(f"Name: {title}, Tracks: {tracks}")
    # print(playlist["external_urls"]["spotify"])

    # retrieve id and get playlist data
    id = playlist["external_urls"]["spotify"][34:]
    playlist = getPlaylist(accessToken, id)

    # calcuate stats for >2 years, <6 months, and in between
    outdatedPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, "2000-01-01", twoYearsAgoFormatted), 4)) * 100
    recentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, sixMonthsAgoFormatted, todayFormatted), 4)) * 100
    somewhatRecentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, twoYearsAgoFormatted, sixMonthsAgoFormatted), 4)) * 100
    
    # print stats after song
    # print(str(outdatedPercentage) + " " + str(recentPercentage) + " " + str(somewhatRecentPercentage))

    # make object of playlist stats
    playlistStats.append(PlaylistStats(title, tracks, outdatedPercentage, recentPercentage, somewhatRecentPercentage))


# sorting lists by stats
sortedByTracks = sorted(playlistStats, key=lambda playlist: playlist.tracks, reverse=True)
sortedByOutdated = sorted(playlistStats, key=lambda playlist: playlist.outdated, reverse=True)
sortedByRecent = sorted(playlistStats, key=lambda playlist: playlist.recent, reverse=True)
sortedBySomewhatRecent = sorted(playlistStats, key=lambda playlist: playlist.somewhat_recent, reverse=True)

# printing stats
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

# End Time
end_time = time.time()
total_time = end_time - start_time
print(f"Total time: {total_time} seconds")