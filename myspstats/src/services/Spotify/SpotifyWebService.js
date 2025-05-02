/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';


/*
 * useSpotifyWebService
 * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage } = useCalculatePlaylistStatsService();

    /*
     * retrievePlaylistsWithStats
     * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
     */
    const retrievePlaylistsWithStats = async () => {
        try {
            // Fetch playlists
            const playlists = await fetchPlaylists();
            if (!playlists) throw new Error("Failed to fetch playlists")

            // Delay function for throttling requests
            const playlistSongs = {};
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            // Fetch songs for each playlists
            await Promise.all(
                playlists.map(async (playlist, index) => {
                    await delay(index * 200); // Introduces a delay of 200ms per request
                    const songs = await fetchPlaylistSongs(playlist.id);
                    playlistSongs[playlist.id] = songs || [];
                })
            );

            // initialize stat and time variables
            const playlistStats = {}
            const today = new Date();
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const zeroDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});

            // Calculate playlist stats and map to playlist id
            playlists.map((playlist) => {
                if (playlist) playlistStats[playlist.id] = {
                    "twoYearPercentage" : calculateSongTimeRangePercentage(playlistSongs[playlist.id] || [], "2000-01-01", twoYearsAgo),
                    "sixMonthPercentage": calculateSongTimeRangePercentage(playlistSongs[playlist.id] || [], sixMonthsAgo, zeroDaysAgo),
                    "lastSongAdded": (playlistSongs[playlist.id].length > 0 ? playlistSongs[playlist.id][playlistSongs[playlist.id].length - 1].added_at : "No songs")
                }
            });

            return { playlists, playlistStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsWithStats }
}

export default SpotifyWebService;