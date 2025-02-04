import { useState, useEffect } from 'react';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || "ce2f9c2411d246a1a50d78321cd3661f";
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI || "http://localhost:3000/callback.html";
const SCOPES = 'playlist-read-private';
const SPOTIFY_AUTH_URL = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES)}`;

const useAccessToken = () => {
    const [accessToken, setAccessToken] = useState(null);

    // Extract access token from URL
    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('access_token')) {
            console.log("Access Token is in URL")
            const token = new URLSearchParams(hash.slice(1)).get('access_token');
            setAccessToken(token);
            window.history.replaceState(null, null, ' '); // Clean the URL
        }
    }, []);

    return { accessToken, loginUrl: SPOTIFY_AUTH_URL };
}

const useSpotifyPlaylists = (accessToken) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch playlists
    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!accessToken) return;

            setLoading(true);
            setError(null);
            let allPlaylists = [];
            let url = 'https://api.spotify.com/v1/me/playlists';

            try {
                while (url) {
                    const response = await axios.get(url, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                        params: {limit: "50", offset: "0"}
                    });

                    allPlaylists = [...allPlaylists, ...response.data.items];
                    url = response.data.next;
                }
                setPlaylists(allPlaylists);
            } catch (err) {
                console.error('Error fetching playlists:', err);
                setError(err.response?.data?.error?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchPlaylists();
    }, [accessToken]);

    return { playlists, loading, error};
};

const useSpotifySongs = (accessToken, playlistId) => {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch songs
    useEffect(() => {
        const fetchSongs = async () => {
            if (!accessToken) return;

            setLoading(true);
            setError(null);
            let allSongs = [];
            let url = 'https://api.spotify.com/v1/playlists/' + playlistId
            console.log(url)
            console.log(accessToken)

            try {
                while (url) {
                    const response = await axios.get(url, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    });

                    allSongs = [...allSongs, ...response.data.tracks.items];
                    url = response.data.next;
                }
                setSongs(allSongs);
            } catch (err) {
                console.error('Error fetching songs:', err);
                setError(err.response?.data?.error?.message || 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, [accessToken, playlistId]);

    return { songs, loading, error};
};

export {
    useAccessToken,
    useSpotifyPlaylists,
    useSpotifySongs
}