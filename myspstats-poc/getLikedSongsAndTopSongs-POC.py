# Eli Dow
# January 2025
# MySPStats POC in Python

import os
import requests
import urllib.parse
import base64
import hashlib
import secrets
from dotenv import load_dotenv
import time

load_dotenv()

clientId = os.getenv("CLIENT_ID")
filePath = os.getenv("FILE_PATH")
redirectUri = os.getenv("REDIRECT_URI")
scope = "user-read-private user-read-email playlist-read-private user-top-read user-library-read"

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

# Given a valid user access token, requests the Spotify Web API to retrieve the user's saved songs
def getSavedSongs(accessToken):
    savedSongs = []
    url = "https://api.spotify.com/v1/me/tracks"
    headers = {
        "Authorization": "Bearer " + accessToken
    }
    params = {
        "market": "ES",
        "limit": 50,
        "offset": 0
    }

    # retrieves playlist data in chunks
    while url:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            raise Exception(f"Failed to get saved songs: {response.status_code}, {response.text}")
    
        data = response.json()
        filtered = [songs for songs in data['items']]

        savedSongs.extend(filtered)

        url = data.get('next')

    return savedSongs

# Given a valid user access token and a time range, requests the Spotify Web API to retrieve the user's top listened to songs
def getTopSongs(accessToken, timeRange):
    topSongs = []
    url = "https://api.spotify.com/v1/me/top/tracks"
    headers = {
        "Authorization": "Bearer " + accessToken
    }
    params = {
        "time_range": timeRange,
        "limit": 50,
        "offset": 0
    }

    i = 0

    # retrieves playlist data in chunks
    while url and i < 50:
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            raise Exception(f"Failed to get top songs: {response.status_code}, {response.text}")
    
        data = response.json()
        filtered = [songs for songs in data['items']]

        topSongs.extend(filtered)

        url = data.get('next')

        i += 1

    return topSongs

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

# initialize playlistStats
savedSongs = getSavedSongs(accessToken)
savedSongIds = []

print("Saved Songs:")
with open(filePath + 'savedSongs.txt', 'w') as file:
    for song in savedSongs:
        file.write(f"Name: {song['track']['name']}, ID: {song['track']['id']}\n")
        savedSongIds.append(song['track']['id'])

topSongs = getTopSongs(accessToken, "long_term")
topSongIds = []
topSavedSongs = []

print("\n Top Songs:")

with open(filePath + 'topSongs.txt', 'w') as file:
    for song in topSongs:
        file.write(f"Name: {song['name']}, ID: {song['id']}\n")
        if song['id'] in savedSongIds:
            topSavedSongs.append(song['name'])
            topSongIds.append(song['id'])

with open(filePath + 'topSavedSongs.txt', 'w') as file:
    for song in topSavedSongs:
        file.write(song + "\n")

notTopSavedSongs = [song['track']['name'] for song in savedSongs if song['track']['id'] not in topSongIds]
with open(filePath + 'notTopSavedSongs.txt', 'w') as file:
    for song in notTopSavedSongs:
        file.write(song + "\n")

print()

# end time
end_time = time.time()
total_time = end_time - start_time
print(f"Total time: {total_time} seconds")