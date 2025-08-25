/* SpotifyWebService */

import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';
import useCalculatePlaylistMetaStatsService from './CalculatePlaylistMetaStatsService';
import pLimit from 'p-limit';

/*
 * useSpotifyWebService
 * Custom react hook used to interact with API layer and calculate playlist statistics
 */
const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs, fetchSavedSongs, fetchTopSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage, calculateMostFrequentArtist,
            calculateAverageReleaseDate, calculateAverageDateAdded,
            calculateAverageSongDuration, calculateAverageSongPopularityScore,
            calculateMostTopSongsByTimeRange, calculateSavedSongPercentage,
            calculateArtistDiversityScore } = useCalculatePlaylistStatsService();
    const { calculateFinalMetaStat } = useCalculatePlaylistMetaStatsService();

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

        topSongs["short_term"] = await runLimited(fetchTopSongs, ["short_term", 2]);
        topSongs["medium_term"] = await runLimited(fetchTopSongs, ["medium_term", 5]);
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
    const computePlaylistStats = (playlists, playlistSongs, topSongs, savedSongs, dates) => {
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
                shortTermPercentage: songs.length > 0 ? calculateMostTopSongsByTimeRange(songs, topSongs["short_term"]): "No songs",
                mediumTermPercentage: songs.length > 0 ? calculateMostTopSongsByTimeRange(songs, topSongs["medium_term"]): "No songs",
                longTermPercentage: songs.length > 0 ? calculateMostTopSongsByTimeRange(songs, topSongs["long_term"]): "No songs",
                savedSongPercentage: songs.length > 0 ? calculateSavedSongPercentage(songs, savedSongs): "No songs",
                artistDiversityScore: songs.length > 0 ? calculateArtistDiversityScore(songs): "No songs"
            };
        });

        return stats;
    };

    /*
     * calculatePlaylistStats
     * Calculates all necessary playlist stats
     */
    const computePlaylistMetaStats = (playlists, playlistStats) => {
        const metaStats = {};

        playlists.forEach((playlist) => {
            metaStats[playlist.id] = {
                playlistScore: calculateFinalMetaStat(playlistStats[playlist.id])
            };
        });

        return metaStats;
    };

    /*
     * retrievePlaylistsWithStats
     * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
     */
    const retrievePlaylistsWithStats = async () => {
        try {
            let start = Date.now();

            const playlists = await getPlaylists();
            const playlistSongs = await getPlaylistSongs(playlists);
            const topSongs = await getTopsSongs();
            const savedSongs = await getSavedSongs();

            let end = Date.now() - start;
            console.log("End: " + end)


            const dates = getDates();
            const playlistStats = computePlaylistStats(playlists, playlistSongs, topSongs, savedSongs, dates);
            const playlistMetaStats = computePlaylistMetaStats(playlists, playlistStats);

            return { playlists, playlistSongs, playlistStats, playlistMetaStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsWithStats }
}

export default SpotifyWebService;