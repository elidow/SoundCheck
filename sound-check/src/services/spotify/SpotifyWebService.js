/* SpotifyWebService */

import pLimit from 'p-limit';
import { get, set } from 'idb-keyval';
import useSpotifyWebApi from './SpotifyWebApi';

/*
 * useSpotifyWebService
 * Functional component to interact with Spotify Web API layer
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs, fetchSavedSongs,
        fetchTopSongs, fetchRecentlyPlayedSongs, fetchUserProfile } = useSpotifyWebApi();

    // Cache keys for localStorage for top and saved songs (updated daily)
    const CACHE_KEYS = {
        TOP_SONGS: 'spotify_top_songs',
        TOP_SONGS_TIMESTAMP: 'spotify_top_songs_timestamp',
        SAVED_SONGS: 'spotify_saved_songs',
        SAVED_SONGS_TIMESTAMP: 'spotify_saved_songs_timestamp',
    };

    // Allow maximum 6 concurrent requests max
    const limit = pLimit(6);

    // Check if local storage timestamp is today
    const isToday = (timestamp) => {
        const today = new Date().toDateString();
        const cacheDate = new Date(parseInt(timestamp)).toDateString();
        return today === cacheDate;
    };

    // Delay function for throttling requests
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    /*
     * fetchWithRetry
     * Fetches data from API with retry logic
     */
    const fetchWithRetry = async(fn, args = [], maxRetries=3, initialDelay=1000) => {
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                if (attempt > 0) {
                    const currentDelay = initialDelay * Math.pow(2, attempt - 1);
                    await delay(currentDelay); 
                }

                return await fn(...args);
            } catch (error) {
                console.error(`Error in fetchWithRetry (attempt ${attempt + 1}/${maxRetries}) for function ${fn.name}:`, error);
                attempt++;
                if (attempt >= maxRetries) {
                    console.error(`Hit max retries for function ${fn.name}:`, error);
                    return [];
                }
            }
        }
    };

    // Limit fetchWithRetry to limit
    const runLimited = (fn, args) => limit(() => fetchWithRetry(fn, args));

    /*
     * getPlaylists
     * Fetches all playlists from API
     */
    const getPlaylists = async() => {
        const playlists = await runLimited(fetchPlaylists);
        if (!playlists) throw new Error("Failed to fetch playlists");
        return playlists;
    };

    /*
     * getPlaylistSongs
     * Fetches all playlist songs from API with throttling
     */
    const getPlaylistSongs = async(playlists) => {
        // Fetch songs for each playlist
        const playlistSongs = {};
        await Promise.all(
            playlists.map(async (playlist) => {
                const songs = await runLimited(fetchPlaylistSongs, [playlist.id]);
                playlistSongs[playlist.id] = songs || [];
            })
        );    
        
        return playlistSongs;
    };

    /*
     * getTopsSongs
     * Fetches all top played songs from API or cache
     */
    const getTopsSongs = async() => {
        // Check for cached data
        const cached = localStorage.getItem(CACHE_KEYS.TOP_SONGS);
        const timestamp = localStorage.getItem(CACHE_KEYS.TOP_SONGS_TIMESTAMP);
        
        if (cached && timestamp && isToday(timestamp)) {
            const parsedCache = JSON.parse(cached);
            // Check if any of the time periods have data
            if (parsedCache.short_term?.length > 0 && parsedCache.medium_term?.length > 0 && parsedCache.long_term?.length > 0) {
                console.log('Using cached top songs (updated today)');
                return parsedCache;
            }
        }

        // Fetch fresh data
        console.log('Fetching fresh top songs from API');
        const topSongs = {};
        topSongs["short_term"] = await runLimited(fetchTopSongs, ["short_term", 5]);
        topSongs["medium_term"] = await runLimited(fetchTopSongs, ["medium_term", 10]);
        topSongs["long_term"] = await runLimited(fetchTopSongs, ["long_term", 15]);
        
        // Cache the data with timestamp
        localStorage.setItem(CACHE_KEYS.TOP_SONGS, JSON.stringify(topSongs));
        localStorage.setItem(CACHE_KEYS.TOP_SONGS_TIMESTAMP, Date.now().toString());
        
        return topSongs;
    };

    /*
     * getSavedSongs
     * Fetches all saved songs from API or cache
     */
    const getSavedSongs = async () => {
        const cached = await get(CACHE_KEYS.SAVED_SONGS);
        const timestamp = await get(CACHE_KEYS.SAVED_SONGS_TIMESTAMP);

        if (cached && timestamp && isToday(timestamp)) {
            // Check if cache is not empty
            if (Array.isArray(cached) && cached.length > 0) {
                console.log('Using cached saved songs (updated today)');
                return cached;
            }
        }

        console.log('Fetching fresh saved songs from API');
        const savedSongs = await runLimited(fetchSavedSongs);

        await set(CACHE_KEYS.SAVED_SONGS, savedSongs);
        await set(CACHE_KEYS.SAVED_SONGS_TIMESTAMP, Date.now());

        return savedSongs;
    };

    /*
     * getRecentlyPlayedSongs
     * Fetches all recently played songs from API
     */
    const getRecentlyPlayedSongs = async() => {
        const recentlyPlayedSongs = await runLimited(fetchRecentlyPlayedSongs);
        return recentlyPlayedSongs;
    };

    /*
     * getUserProfile
     * Fetches user profile from API
     */
    const getUserProfile = async() => {
        const userProfile = await runLimited(fetchUserProfile);
        return userProfile;
    };

    /*
     * retrievePlaylistsAndSongs
     * Retrieves all data from Spotify API or cache
     */
    const retrievePlaylistsAndSongs = async () => {
        try {
            let start = Date.now();

            const playlists = await getPlaylists();
            const playlistSongs = await getPlaylistSongs(playlists);
            const topSongs = await getTopsSongs();  // Now uses cache if available
            const savedSongs = await getSavedSongs();  // Now uses cache if available
            const recentlyPlayedSongs = await getRecentlyPlayedSongs();
            const userProfile = await getUserProfile();

            let end = Date.now() - start;
            console.log("Data retrieval completed in: " + end + "ms");

            return { playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs, userProfile };
        } catch (error) {
            console.error("Error in service:", error);
            throw error;
        }
    };

    return { retrievePlaylistsAndSongs, getPlaylistSongs };
};

export default SpotifyWebService;