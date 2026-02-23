/* SpotifyWebApi */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-read-private user-read-email playlist-read-private user-top-read user-library-read user-read-recently-played";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: "spotify_access_token",
    REFRESH_TOKEN: "spotify_refresh_token",
    TOKEN_TIMESTAMP: "spotify_token_timestamp",
    CODE_VERIFIER: "spotify_code_verifier",
};

/*
 * generateCodeVerifier
 * Given an integer (length), returns a string that represents a generated code verifier of given length
 * This code verifier is a high-entropy cryptographic random string with a length between 43 and 128 characters (Aa1_.-`)
 */
const generateCodeVerifier = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
 }

/* 
 * generateCodeChallenge
 * Given a string (code verifier), returns a string that represents a generates code challenge
 * First, the code verifier is hashed using a SHA256 algorithm. The result is a digest to be used for the user authorization request
 * Then, the digest is encoded to the base64 version. The result is the code challenge to be returned
 */
const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Base64 URL encode
};

/* 
 * isTokenExpired
 * Returns whether the locally stored access token has expired or not
 */
const isTokenExpired = () => {
    const timestamp = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN_TIMESTAMP);
    if (!timestamp) return true;
    const elapsed = (Date.now() - parseInt(timestamp)) / 1000; // in seconds
    return elapsed > 3600; // token expires in 1 hour
};

/*
 * useSpotifyWebApi
 * Custom react hook used to interact with Spotify Web API directly
 * Authorization Code with PKCE flow for secure data retrieval:
 * - Generate random string (code verifier) and hashes it (PKCE code challenge).
 * - Request user authorization given verifier/PCKE code challenge. App will redirect to Spotify Authroization Login Page
 * - User grants permission. App will redirect to redirect uri with authroization code
 * - Fetch valid access given authorization code
 */
const useSpotifyWebApi = () => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN));

    /*
     * initiateUserAuthorization
     * Requests user authorization and retrieves authroization code
     */
    const initiateUserAuthorization = async() => {
        // Generate code verifier and code challenge
        const codeVerifier = generateCodeVerifier(64);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        // Create a new URL object for authorization (do NOT reuse AUTH_URL globally)
        const authUrl = new URL("https://accounts.spotify.com/authorize");

        authUrl.searchParams.append("client_id", CLIENT_ID);
        authUrl.searchParams.append("response_type", "code");
        authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.append("scope", SCOPES);
        authUrl.searchParams.append("code_challenge_method", "S256");
        authUrl.searchParams.append("code_challenge", codeChallenge);

        console.log("Redirecting to Spotify for authorization:", authUrl.toString());
        window.location.href = authUrl.toString();
    };

    /*
     * fetchAccessToken
     * Given authorization code, fetch valid access token
     */
    const fetchAccessToken = useCallback(async (code) => {
        // Retrieve and confirm code verifier
        const codeVerifier = localStorage.getItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER);
        if (!codeVerifier) {
            console.warn("No code verifier found in localStorage");
            return;
        }

        try {
            // Fetch access token
            const response = await axios.post(TOKEN_ENDPOINT, new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
            
            // Store access token
            const { access_token, refresh_token } = response.data;
            setAccessToken(access_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, access_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_TIMESTAMP, Date.now().toString());

            // Remove code verifier now that it's used
            localStorage.removeItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER);

            // Redirect to app
            window.history.replaceState({}, document.title, "/playlists");
        } catch (err) {
            console.error("Failed to request user authentication:", err.response ? err.response.data : err.message);
        }
    }, []);

    /*
     * refreshAccessToken
     * Refreshes access token
     */
    const refreshAccessToken = useCallback(async () => {
        // Retrieve refresh token and confirm (request user authroization otherwise)
        const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) {
            console.warn("No refresh token found in local storage");
            return initiateUserAuthorization();
        }

        try {
            // Fetch new access token
            const response = await axios.post(TOKEN_ENDPOINT, new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: refreshToken,
                client_id: CLIENT_ID
            }), { headers: { "Content-Type": "application/x-www-form-urlencoded" }});

            // Store new access token
            const { access_token } = response.data;
            setAccessToken(access_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, access_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN_TIMESTAMP, Date.now().toString());
        } catch (err) {
            console.warn("Failed to refresh token, logging in again...", err);
            initiateUserAuthorization();
        }
    }, []);

    // NOTE: IF YOU HAVE AN AUTHENTICATION ISSUE, FORCE REAUTHORIZATION:
    // 1. UNCOMMENT THIS FUNCTION
    // 2. CALL forceReauth() in the first elseIf block
    // 3. Call fetchAccassToken in the elseIf block
    // 4. Revert
    // OR
    // Check into feature/common-scores branch and check back into current later
    // const forceReauth = useCallback(() => {
    //     console.log("Forcing Spotify reauthorization – clearing stored tokens...");
    //     Object.values(LOCAL_STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    //     initiateUserAuthorization();
    // }, []);

    /*
     * useEffect
     * Handle logic on load to fetch or refresh access token
     */
    useEffect(() => {
        // Check if the URL contains the 'code' parameter
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const accessToken = localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);
    
        // if code exists, fetch access token. If code does not exist or the token expired
        if (code) {
            fetchAccessToken(code);
        } else if (!accessToken || isTokenExpired()) {
            refreshAccessToken();
        } else {
            setAccessToken(accessToken);
        }
    }, [fetchAccessToken, refreshAccessToken]);

    /*
     * fetchPlaylists
     * Given an access token, fetch all playlists from a user's account
     */
    const fetchPlaylists = useCallback(async () => {
        // Validate access token
        if (!accessToken) {
            console.log("No access token found for playlists");
            return [];
        }

        try {
            // Fetch playlists with pagination
            let playlists = []
            let nextUrl = "https://api.spotify.com/v1/me/playlists";

            while (nextUrl) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: {limit: "50", offset: "0"}
                });

                playlists = [...playlists, // spread operator (...) expands an array into individual elements and makes shallow copies
                    ...response.data.items.filter(item => item.owner.display_name === "eliasjohnsondow" &&
                        !item.name.includes("On Repeat 🎧"))];
                nextUrl = response.data.next;
            }
            console.log("SpotifyWebApi: Playlists: ", playlists);
            return playlists;
        } catch (err) {
            console.error("Spotify Web Api failed to fetch playlists:", err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    /*
     * fetchPlaylistSongs
     * Given an access token and a playlist id, fetch all songs a user account's playlist
     */
    const fetchPlaylistSongs = useCallback(async (playlistId) => {
        // Validate access token
        if (!accessToken) {
            console.log(`No access token found for playlist ${playlistId}`);
            return [];
        }

        try {
            // Fetch playlist songs with pagination
            let playlistSongs = []
            let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

            while (nextUrl) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                playlistSongs = [...playlistSongs, ...response.data.items];
                nextUrl = response.data.next;
            }

            console.log(`SpotifyWebApi: Playlist Songs for ${playlistId}:`, playlistSongs)
            return playlistSongs
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch playlists songs for ${playlistId}:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            } else if (err.response && err.response.status === 429) {
                console.warn("Client request limit exceeded");
                throw err;
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    /*
     * fetchTopSongs
     * Given an access token and a time range variable, fetch the top songs for a user account within that time range
     * Default 1 page
     */
    const fetchTopSongs = useCallback(async (timeRange, pages=1) => {
        // Validate access token
        if (!accessToken) {
            console.log(`No access token found for call to get ${timeRange} tracks`);
            return [];
        }

        try {
            // Fetch playlist songs with pagination
            let topSongs = []
            let nextUrl = `https://api.spotify.com/v1/me/top/tracks`;
            let i = 0

            while (nextUrl && i < pages) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: {time_range: timeRange, limit: "50", offset: "0"}
                });

                topSongs = [...topSongs, ...response.data.items];
                nextUrl = response.data.next;
                i += 1;
            }

            console.log(`SpotifyWebApi: Top Songs for ${timeRange} tracks:`, topSongs)
            return topSongs
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch playlists songs for ${timeRange} tracks:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    /*
     * fetchSavedSongs
     * Given an access token, fetch the user's saved songs (Liked)
     * Default 20 pages
     */
    const fetchSavedSongs = useCallback(async (maxPages=62) => {
        // Validate access token
        if (!accessToken) {
            console.log(`No access token found for call to get saved songs`);
            return [];
        }

        try {
            // Fetch saved songs with pagination
            let savedSongs = []
            let nextUrl = `https://api.spotify.com/v1/me/tracks`;
            let i = 0

            while (nextUrl && i < maxPages) {
                const response = await axios.get(nextUrl, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                    params: {market: "ES", limit: "50", offset: "0"}
                });

                savedSongs = [...savedSongs, ...response.data.items];
                nextUrl = response.data.next;
                i += 1;
            }

            console.log(`SpotifyWebApi: Saved Songs:`, savedSongs)
            return savedSongs
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch saved songs:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    /*
     * fetchRecentlyPlayedSongs
     * Given an access token, fetch the user's recently played songs
     */
    const fetchRecentlyPlayedSongs = useCallback(async () => {
        // Validate access token
        if (!accessToken) {
            console.log(`No access token found for call to get recently played songs`);
            return [];
        }

        try {
            // Fetch recently played songs with pagination
            let recentlyPlayedSongs = []
            let url = `https://api.spotify.com/v1/me/player/recently-played`;

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
                params: {limit: "50"}
            });
    
            recentlyPlayedSongs = [...recentlyPlayedSongs, ...response.data.items];
            
            console.log(`SpotifyWebApi: Recently Played Songs:`, recentlyPlayedSongs)
            return recentlyPlayedSongs
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch recently played songs:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    /*
     * fetchUserProfile
     * Given an access token, fetch the user's profile information
     */
    const fetchUserProfile = useCallback(async () => {
        // Validate access token
        if (!accessToken) {
            console.log(`No access token found for call to get user profile`);
            return null;
        }

        try {
            const response = await axios.get(`https://api.spotify.com/v1/me`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            console.log(`SpotifyWebApi: User Profile:`, response.data)
            return response.data;
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch user profile:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return null;
        }
    }, [accessToken, refreshAccessToken]);

    return { fetchPlaylists, fetchPlaylistSongs, fetchSavedSongs, fetchTopSongs, fetchRecentlyPlayedSongs, fetchUserProfile }
}

export default useSpotifyWebApi;