/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';

/*
 * useSpotifyWebService
 * Custom react hook used to interact with API layer and calculate playlist statistics
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs, fetchSavedSongs, fetchTopSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage, calculateMostFrequentArtist,
            calculateAverageReleaseDate, calculateAverageDateAdded,
            calculateAverageSongDuration, calculateAverageSongPopularityScore,
            calculateMostTopSongsByTimeRange, calculateArtistDiversityScore } = useCalculatePlaylistStatsService();

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
                await delay(index * index * 7); // Introduces a delay of 100ms per request
                const songs = await fetchPlaylistSongs(playlist.id);
                playlistSongs[playlist.id] = songs || [];
            })
        );    
        
        return playlistSongs;
    }

    /*
     * getSavedSongs
     * Fetches all saved songs from API
     */
    const getSavedSongs = async() => {
        const savedSongs = await fetchSavedSongs();
        return savedSongs;
    }

    /*
     * getTopSongs
     * Fetches all top played songs from API
     */
    const getTopsSongs = async() => {
        const topSongs = {};

        topSongs["short_term"] = await fetchTopSongs("short_term");
        topSongs["medium_term"] = await fetchTopSongs("medium_term");
        topSongs["long_term"] = await fetchTopSongs("long_term");
        
        return topSongs;
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
    const computePlaylistStats = (playlists, playlistSongs, savedSongs, topSongs, dates) => {
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
                avgSongPopularityScore: songs.length > 0 ? calculateAverageSongPopularityScore(songs): "No songs",
                mostShortTermTopSongs: songs.length > 0 ? calculateMostTopSongsByTimeRange(songs, topSongs["short_term"]): "No songs",
                mostMediumTermTopSongs: songs.length > 0 ? calculateMostTopSongsByTimeRange(songs, topSongs["medium_term"]): "No songs",
                artistDiversityScore: songs.length > 0 ? calculateArtistDiversityScore(songs): "No songs"
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
            const savedSongs = await getSavedSongs();
            const topSongs = await getTopsSongs();
            const dates = getDates();
            const playlistStats = computePlaylistStats(playlists, playlistSongs, savedSongs, topSongs, dates);

            return { playlists, playlistSongs, playlistStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsWithStats }
}

export default SpotifyWebService;