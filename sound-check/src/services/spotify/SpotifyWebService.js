/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import pLimit from 'p-limit';

/*
 * useSpotifyWebService
 * Functional component to interact with Spotify Web API layer
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs, fetchSavedSongs, fetchTopSongs, fetchRecentlyPlayedSongs } = useSpotifyWebApi();

    // Delay function for throttling requests
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Allow 5 concurrent requests max
    const limit = pLimit(6);

    // Limit fetchWithRetry to limit
    const runLimited = (fn, args) => limit(() => fetchWithRetry(fn, args));

    /*
     * getPlaylistSongsWithRetry
     * Fetches all playlist songs from API with retry
     */
    const fetchWithRetry = async(fn, args = [], maxRetries=3, initialDelay=1000) => {
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                if (attempt > 0) {
                    const currentDelay = initialDelay * Math.pow(2, attempt -1);
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
    }

    /*
     * getPlaylists
     * Fetches all playlists from API
     */
    const getPlaylists = async() => {
        const playlists = await runLimited(fetchPlaylists);
        if (!playlists) throw new Error("Failed to fetch playlists");
        return playlists;
    }

    /*
     * getPlaylistSongs
     * Fetches all playlist songs from API with throttling
     */
    const getPlaylistSongs = async(playlists) => {

        // Fetch songs for each playlists
        const playlistSongs = {};
        await Promise.all(
            playlists.map(async (playlist) => {
                //await delay(index * index * 6); // Introduces a delay (this is 28 seconds)
                const songs = await runLimited(fetchPlaylistSongs, [playlist.id]);
                playlistSongs[playlist.id] = songs || [];
            })
        );    
        
        return playlistSongs;
    }

    /*
     * getTopSongs
     * Fetches all top played songs from API
     */
    const getTopsSongs = async() => {
        const topSongs = {};

        topSongs["short_term"] = await runLimited(fetchTopSongs, ["short_term", 4]);
        topSongs["medium_term"] = await runLimited(fetchTopSongs, ["medium_term", 6]);
        topSongs["long_term"] = await runLimited(fetchTopSongs, ["long_term", 10]);
        
        return topSongs;
    }

    /*
     * getSavedSongs
     * Fetches all saved songs from API
     */
    const getSavedSongs = async() => {
        const savedSongs = await runLimited(fetchSavedSongs);
        return savedSongs;
    }

    /*
     * getRecentlyPlayedSongs
     * Fetches all recently played songs from API
     */
    const getRecentlyPlayedSongs = async() => {
        const recentlyPlayedSongs = await runLimited(fetchRecentlyPlayedSongs);
        return recentlyPlayedSongs;
    }

    /*
     * retrievePlaylistsAndSongs
     * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
     */
    const retrievePlaylistsAndSongs = async () => {
        try {
            let start = Date.now();

            const playlists = await getPlaylists();
            const playlistSongs = await getPlaylistSongs(playlists);
            const topSongs = await getTopsSongs();
            const savedSongs = await getSavedSongs();
            const recentlyPlayedSongs = await getRecentlyPlayedSongs();

            let end = Date.now() - start;
            console.log("End: " + end)

            return { playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsAndSongs }
}

export default SpotifyWebService;