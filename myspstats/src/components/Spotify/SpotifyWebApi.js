import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const SCOPES = 'playlist-read-private';
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;

const useSpotifyWebApi = () => {
    const [accessToken, setAccessToken] = useState(null);
    const [spotifyError, setSpotifyError] = useState(null);

    // Extract access token from URL
    useEffect(() => {
        const hash = window.location.hash;
        console.log(SPOTIFY_AUTH_URL)
        if (hash.includes('access_token')) {
            const token = new URLSearchParams(hash.slice(1)).get('access_token');
            console.log("Access token found:", token);
            setAccessToken(token);
            window.history.replaceState(null, null, ' '); // Clean the URL
        } else {
            console.log("No access token in URL")
        }
    }, []);

    // Fetch playlists
    const fetchPlaylists = useCallback(async () => {
        if (!accessToken) {
            console.log("No access token found for playlists");
            return [];
        }

        try {
            let playlists = []
            let nextUrl = "https://api.spotify.com/v1/me/playlists"; // pagination

            while (nextUrl) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: {limit: "50", offset: "0"}
                });

                // set playlists to original list + response
                playlists = [...playlists, // spread operator (...) expands an array into individual elements and makes shallow copies
                    ...response.data.items.filter(item => item.owner.display_name === "eliasjohnsondow" && !item.name.includes("Cape Cod"))]
                nextUrl = response.data.next
            }
            console.log("Playlists: ", playlists)
            return playlists
        } catch (err) {
            setSpotifyError("Error fetching playlist")
            console.error("Spotify Web Api failed to fetch playlists:", err);
        }

    }, [accessToken]);

    const fetchPlaylistSongs = useCallback(async (playlistId) => {
        if (!accessToken) {
            console.log(`No access token found for playlist ${playlistId}`);
            return [];
        }

        try {
            let playlistSongs = []
            let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`; // pagination

            while (nextUrl) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                // set playlist songs to original list + response
                playlistSongs = [...playlistSongs, ...response.data.items]// spread operator (...)
                nextUrl = response.data.next
            }


            console.log(`Playlist Songs for ${playlistId}:`, playlistSongs)
            return playlistSongs
        } catch (err) {
            setSpotifyError("Error fetching playlist songs")
            console.error(`Spotify Web Api failed to fetch playlists songs for ${playlistId}:`, err);
        }


    }, [accessToken]);

    return {fetchPlaylists, fetchPlaylistSongs, spotifyError}
}

export default useSpotifyWebApi;