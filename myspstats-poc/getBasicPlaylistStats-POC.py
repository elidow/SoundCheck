# Eli Dow
# January 2025
# MySPStats POC in Python

import os
import requests
import urllib.parse
import base64
import hashlib
import secrets
from datetime import datetime
from dateutil.relativedelta import relativedelta
from dotenv import load_dotenv
import time

load_dotenv()

clientId = os.getenv("CLIENT_ID")
redirectUri = os.getenv("REDIRECT_URI")
scope = "playlist-read-private playlist-read-collaborative"

# Generate a code verifier
def generate_code_verifier():
    return base64.urlsafe_b64encode(secrets.token_bytes(64)).rstrip(b'=').decode('utf-8')

# Given a code verifier, generate a code challenge
def generate_code_challenge(verifier):
    sha256 = hashlib.sha256(verifier.encode('utf-8')).digest()
    return base64.urlsafe_b64encode(sha256).rstrip(b'=').decode('utf-8')

# Given a client id, redirect uri, authorization code, and codeverifier
# request Spotify Web Api to exchange an authroization code for an access Token
def getTokenPKCE(clientId, redirectUri, authorizationCode, code_verifier):
    url = "https://accounts.spotify.com/api/token"
    data = {
        "client_id": clientId,
        "grant_type": "authorization_code",
        "code": authorizationCode,
        "redirect_uri": redirectUri,
        "code_verifier": code_verifier
    }
    tokenResponse = requests.post(url, data=data)
    if tokenResponse.status_code != 200:
        raise Exception(f"Failed to get access token: {tokenResponse.status_code}, {tokenResponse.text}")
    return tokenResponse.json()

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
# Does not do pagination
def getPlaylist(accessToken, playlistId):
    playlistUrl = "https://api.spotify.com/v1/playlists/" + playlistId
    headers = {
        "Authorization": "Bearer " + accessToken,
    }

    playlistResponse = requests.get(playlistUrl, headers=headers)
    if playlistResponse.status_code != 200:
            raise Exception(f"Failed to get playlists: {playlistResponse.status_code}, {playlistResponse.text}")

    return playlistResponse.json()

# Given a playlist, a start date, and end date,
# Calaculate the percentage of songs that were added between start date and end date (]
def calcPlaylistSongsAddedInRangePercentage(playlist, startDate, endDate):
    playlistSongs = playlist["tracks"]["items"]
    outdated = 0
    for i in range(len(playlistSongs)):
        dateAdded = playlistSongs[i]["added_at"]
        if startDate < dateAdded[:9] and dateAdded[:9] <= endDate:
            outdated += 1

    percentage = outdated / len(playlistSongs)
    return percentage


# Class for Playlist Stats
class PlaylistStats:
    def __init__(self, title, tracks, outdated, recent, somewhat_recent):
        self.title = title
        self.tracks = tracks
        self.outdated = outdated
        self.recent = recent
        self.somewhat_recent = somewhat_recent


########## Main Code ##########

# Start time
start_time = time.time()

# create code verifier and challenge
code_verifier = generate_code_verifier()
code_challenge = generate_code_challenge(code_verifier)

# build authorization url
authorizationUrl = (
    "https://accounts.spotify.com/authorize?"
    + urllib.parse.urlencode({
        "client_id": clientId,
        "response_type": "code",
        "redirect_uri": redirectUri,
        "scope": scope,
        "code_challenge_method": "S256",
        "code_challenge": code_challenge
    })
)

# have user retrieve and enter authorization code
print("Go to this URL and authorize the app:\n", authorizationUrl)
authorizationCode = input("Enter the code from the redirect URL: ").strip()

# retrieve access and refresh token
tokens = getTokenPKCE(clientId, redirectUri, authorizationCode, code_verifier)
accessToken = tokens["access_token"]
refreshToken = tokens["refresh_token"]

# get playlists
playlists = getPlaylists(accessToken)

# initialize playlistStats
playlistStats = []

# Get today's date and calculate 6 months ago and 2 years ago
today = datetime.now()
sixMonthsAgo = today - relativedelta(months=6)
twoYearsAgo = today - relativedelta(years=2)

# Format the dates as "YYYY-MM-DD"
todayFormatted = today.strftime("%Y-%m-%d")
sixMonthsAgoFormatted = sixMonthsAgo.strftime("%Y-%m-%d")
twoYearsAgoFormatted = twoYearsAgo.strftime("%Y-%m-%d")

# calculate stats per playlist
for playlist in playlists:
    
    # retrieve and print title and tracks
    title = playlist['name']
    tracks = playlist['tracks']['total']
    print(f"Name: {title}, Tracks: {tracks}")

    # retrieve id and get playlist data
    id = playlist["external_urls"]["spotify"][34:]
    print(f"Id: {id}")
    playlist = getPlaylist(accessToken, id)

    # calcuate stats for >2 years, <6 months, and in between
    outdatedPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, "2000-01-01", twoYearsAgoFormatted), 4)) * 100
    recentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, sixMonthsAgoFormatted, todayFormatted), 4)) * 100
    somewhatRecentPercentage = (round(calcPlaylistSongsAddedInRangePercentage(playlist, twoYearsAgoFormatted, sixMonthsAgoFormatted), 4)) * 100

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

# end time
end_time = time.time()
total_time = end_time - start_time
print(f"Total time: {total_time} seconds")