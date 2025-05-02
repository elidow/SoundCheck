/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';

/*
 * useSpotifyWebService
 * Custom react hook used to interact with API layer and calculate playlist statistics
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage } = useCalculatePlaylistStatsService();

    /*
     * getPlaylists
     * Fetches all playlists from API
     */
    const getPlaylists = async() => {
        const playlists = await fetchPlaylists();
        if (!playlists) throw new Error("Failed to fetch playlists");
        return playlists;
    }

    /*
     * getPlaylistSongs
     * Fetches all playlist songs from API with throttling
     */
    const getPlaylistSongs = async(playlists) => {
        // Delay function for throttling requests
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Fetch songs for each playlists
        const playlistSongs = {};
        await Promise.all(
            playlists.map(async (playlist, index) => {
                await delay(index * 200); // Introduces a delay of 200ms per request
                const songs = await fetchPlaylistSongs(playlist.id);
                playlistSongs[playlist.id] = songs || [];
            })
        );    
        
        return playlistSongs;
    }

    /*
     * getDates
     * Retrieve relevate dates
     */
    const getDates = () => {
        // Initialize dates
        const today = new Date();
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        const zeroDaysAgo = today;

        // Format and return dates
        const formatDate = (date) =>
            date.toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });

        return {
            twoYearsAgo: formatDate(twoYearsAgo),
            sixMonthsAgo: formatDate(sixMonthsAgo),
            zeroDaysAgo: formatDate(zeroDaysAgo),
        };
    };

    /*
     * calculatePlaylistStats
     * Calculates all necessary playlist stats
     */
    const computePlaylistStats = (playlists, playlistSongs, dateRanges) => {
        const stats = {};

        playlists.forEach((playlist) => {
            const songs = playlistSongs[playlist.id] || [];
            stats[playlist.id] = {
                twoYearPercentage: calculateSongTimeRangePercentage(songs, "2000-01-01", dateRanges.twoYearsAgo),
                sixMonthPercentage: calculateSongTimeRangePercentage(songs, dateRanges.sixMonthsAgo, dateRanges.zeroDaysAgo),
                lastSongAdded: songs.length > 0 ? songs[songs.length - 1].added_at : "No songs"
            };
        });

        return stats;
    };

    /*
     * retrievePlaylistsWithStats
     * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
     */
    const retrievePlaylistsWithStats = async () => {
        try {
            const playlists = await getPlaylists();
            const playlistSongs = await getPlaylistSongs(playlists);
            const dates = getDates();
            const playlistStats = computePlaylistStats(playlists, playlistSongs, dates);

            return { playlists, playlistStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsWithStats }
}

export default SpotifyWebService;