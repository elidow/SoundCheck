/* MySPStatsService */

import SpotifyWebService from '../Spotify/SpotifyWebService';
import useCalculatePlaylistStatsService from '../stats/CalculatePlaylistStatsService';
import useCalculatePlaylistScoresService from '../scores/CalculatePlaylistScoresService';

/*
 * MySPStats
 * Functional component to handle all MySPStats services
 */
const MySPStatsService = () => {
    const { retrievePlaylistsAndSongs } = SpotifyWebService();
    const { calculateSongTimeRangePercentage, calculateMostFrequentArtist,
            calculateAverageReleaseDate, calculateAverageDateAdded,
            calculateAverageSongDuration, calculateAverageSongPopularityScore,
            calculateMostTopSongsByTimeRange, calculateSavedSongPercentage,
            calculateArtistDiversityScore, calculateRecentlyPlayed } = useCalculatePlaylistStatsService();
    const { calculateFinalMetaStat } = useCalculatePlaylistScoresService();

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
    const computePlaylistStats = (playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs, dates) => {
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
                artistDiversityScore: songs.length > 0 ? calculateArtistDiversityScore(songs): "No songs",
                timesRecentlyPlayed: songs.length > 0 ? calculateRecentlyPlayed(songs, recentlyPlayedSongs): "No songs"
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
    const retrieveAllData = async () => {
        try {
                const { playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs } = await retrievePlaylistsAndSongs();

                const dates = getDates();

                const playlistStats = computePlaylistStats(playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs, dates);
                const playlistMetaStats = computePlaylistMetaStats(playlists, playlistStats);

            return { playlists, playlistSongs, playlistStats, playlistMetaStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrieveAllData }
}

export default MySPStatsService;