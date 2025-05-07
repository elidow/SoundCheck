/* SpotifyWebApi */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AUTH_URL = new URL("https://accounts.spotify.com/authorize");
const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-read-private user-read-email playlist-read-private";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: "spotify_access_token",
    REFRESH_TOKEN: "spoitfy_refresh_token",
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

        // Generate authroization url
        AUTH_URL.searchParams.append("client_id", CLIENT_ID);
        AUTH_URL.searchParams.append("response_type", "code");
        AUTH_URL.searchParams.append("redirect_uri", REDIRECT_URI);
        AUTH_URL.searchParams.append("scope", SCOPES);
        AUTH_URL.searchParams.append("code_challenge_method", "S256");
        AUTH_URL.searchParams.append("code_challenge", codeChallenge);

        // Redirect to authroization url
        console.log("Redirecting url to request user authorization")
        window.location.href = AUTH_URL.toString();
    };

    /*
     * fetchAccessToken
     * Given authorization code, fetch valid access token
     */
    const fetchAccessToken = useCallback(async (code) => {
        // Retrieve and confirm code verifier
        const codeVerifier = localStorage.getItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER);
        if (!codeVerifier) {
            console.warn("No code verifier found");
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

            // Redirect to app
            window.history.replaceState({}, document.title, "/dashboard");
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
                         !item.name.includes("On Repeat 🎧") && !item.name.includes("Top 50") && !item.name.includes("Cape Cod"))]
                nextUrl = response.data.next
            }
            console.log("SpotifyWebApi: Playlists: ", playlists)
            return playlists
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

                playlistSongs = [...playlistSongs, ...response.data.items]
                nextUrl = response.data.next
            }

            console.log(`SpotifyWebApi: Playlist Songs for ${playlistId}:`, playlistSongs)
            return playlistSongs
        } catch (err) {
            console.error(`Spotify Web Api failed to fetch playlists songs for ${playlistId}:`, err);
            if (err.response && err.response.status === 401) {
                console.warn("Access token expired. Refreshing access token");
                await refreshAccessToken();
            }
            return [];
        }
    }, [accessToken, refreshAccessToken]);

    return { fetchPlaylists, fetchPlaylistSongs }
}

export default useSpotifyWebApi;