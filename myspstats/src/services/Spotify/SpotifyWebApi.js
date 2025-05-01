import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;
const SCOPES = "user-read-private user-read-email";

const AUTH_URL = new URL("https://accounts.spotify.com/authorize");
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

const LOCAL_STORAGE_KEYS = {
    ACCESS_TOKEN: "spotify_access_token",
    CODE_VERIFIER: "spotify_code_verifier"
};

// Function to generate a random string for the code verifier
// String is a random high-entropy cryptographic random string with 43-123 character length
const generateCodeVerifier = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
 }

// Function to generate a SHA256 code challenge
// Hashing Code verifier to be sent to user authorization request
const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, ''); // Base64 URL encode
};

const useSpotifyWebApi = () => {
    const [accessToken, setAccessToken] = useState(localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN));

    // Initiate Spotify Login
    const initiateLogin = async() => {
        // Generate code verifier and store it
        const codeVerifier = generateCodeVerifier(64);
        localStorage.setItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER, codeVerifier);

        // Generate code challenge from code verifier (await the promise)
        const codeChallenge = await generateCodeChallenge(codeVerifier);

        console.log("Initiate Login: Code Verifier:", codeVerifier);
        console.log("Initiate Login: Code Challenge:", codeChallenge);

        // Append necessary query parameters
        AUTH_URL.searchParams.append("client_id", CLIENT_ID);
        AUTH_URL.searchParams.append("response_type", "code");
        AUTH_URL.searchParams.append("redirect_uri", REDIRECT_URI);
        AUTH_URL.searchParams.append("scope", SCOPES);
        AUTH_URL.searchParams.append("code_challenge_method", "S256");
        AUTH_URL.searchParams.append("code_challenge", codeChallenge);

        console.log("Final AUTH_URL:", AUTH_URL.toString());

        // Use window.location.assign to change the location
        window.location.href = AUTH_URL.toString();
    };

    // Exchange authorization code for access token
    const fetchAccessToken = useCallback(async (code) => {
        const codeVerifier = localStorage.getItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER);
        if (!codeVerifier) {
            console.error("No code verifier found in local storage");
            return;
        }

        try {
            console.log("Fetch Access Token: Code Verifier", codeVerifier);

            const response = await axios.post(TOKEN_ENDPOINT, new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: "authorization_code",
                code: code,
                redirect_uri: REDIRECT_URI,
                code_verifier: codeVerifier
            }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

            console.log("Access Token: ", response.data.access_token)
            setAccessToken(response.data.access_token);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, response.data.access_token);

            // Clean URL
            window.history.replaceState({}, document.title, "/");
        } catch (err) {
            console.error("Error getting access token:", err.response ? err.response.data : err.message);
        }
    }, []);

    // Check if redirected with authorization code
    useEffect(() => {
        // Check if the URL contains the 'code' parameter
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const codeVerifier = localStorage.getItem(LOCAL_STORAGE_KEYS.CODE_VERIFIER);
    
        // Only fetch token if both code and verifier are present,
        // and do not call initiateLogin if you're already in the middle of token exchange.
        if (code && codeVerifier) {
            console.log("fetching access token");
            fetchAccessToken(code)
                .then(() => {
                    console.log("Token fetched successfully. Redirecting...");
                    setTimeout(() => window.location.assign(AUTH_URL.toString()), 500);
                })
  .             catch((error) => console.error("Token fetch failed:", error));
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
            console.error("Spotify Web Api failed to fetch playlists:", err);
            // if (err.response && err.response.status === 401) {
            //     console.warn("Access token expired. Reinitiating login.");
            //     await initiateLogin(); // PKCE flow will handle redirect
            // }
            return [];
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
            console.error(`Spotify Web Api failed to fetch playlists songs for ${playlistId}:`, err);
            // if (err.response && err.response.status === 401) {
            //     console.warn("Access token expired. Reinitiating login.");
            //     await initiateLogin(); // PKCE flow will handle redirect
            // }
            return [];
        }
    }, [accessToken]);

    return { fetchPlaylists, fetchPlaylistSongs }
}

export default useSpotifyWebApi;