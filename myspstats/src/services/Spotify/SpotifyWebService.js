/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';

/*
 * useSpotifyWebService
 * Custom react hook used to interact with API layer and calculate playlist statistics
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage, calculateMostFrequentArtist,
            calculateAverageReleaseDate, calculateAverageDateAdded,
            calculateAverageSongDuration, calculateAverageSongPopularityScore } = useCalculatePlaylistStatsService();

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
                await delay(index * index * 5); // Introduces a delay of 100ms per request
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
        const zeroDaysAgo = today;
        const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate());
        const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());

        // Format and return dates
        const formatDate = (date) =>
            date.toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });

        return {
            zeroDaysAgo: formatDate(zeroDaysAgo),
            sixMonthsAgo: formatDate(sixMonthsAgo),
            twoYearsAgo: formatDate(twoYearsAgo),
            twoThousandNewYears: "2000-01-01",
        };
    };

    /*
     * calculatePlaylistStats
     * Calculates all necessary playlist stats
     */
    const computePlaylistStats = (playlists, playlistSongs, dates) => {
        const stats = {};

        playlists.forEach((playlist) => {
            const songs = playlistSongs[playlist.id] || [];
            stats[playlist.id] = {
                songCount: songs.length,
                twoYearOldPercentage: songs.length > 0 ? calculateSongTimeRangePercentage(songs, dates.twoThousandNewYears, dates.twoYearsAgo) : "No songs",
                sixMonthNewPercentage: songs.length > 0 ? calculateSongTimeRangePercentage(songs, dates.sixMonthsAgo, dates.zeroDaysAgo) : "No songs",
                lastSongAddedDate: songs.length > 0 ? songs[songs.length - 1].added_at : "No songs",
                avgSongAddedDate: songs.length > 0 ? calculateAverageDateAdded(songs) : "No songs",
                avgSongReleaseDate: songs.length > 0 ? calculateAverageReleaseDate(songs) : "No songs",
                mostFrequentArtistByCount: songs.length > 0 ? calculateMostFrequentArtist(songs, true) : "No songs",
                mostFrequentArtistByPercentage: songs.length > 0 ? calculateMostFrequentArtist(songs, false) : "No songs",
                avgSongDuration: songs.length > 0 ? calculateAverageSongDuration(songs) : "No songs",
                avgSongPopularityScore: songs.length > 0 ? calculateAverageSongPopularityScore(songs): "No songs"
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