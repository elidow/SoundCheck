/* MySPStatsService */

import SpotifyWebService from '../spotify/SpotifyWebService';
import useCalculatePlaylistStatsService from '../stats/CalculatePlaylistStatsService';
import useCalculatePlaylistScoresService from '../scores/CalculatePlaylistScoresService';

/*
 * MySPStatsService
 * Functional component to handle all MySPStats services
 */
const MySPStatsService = () => {
    const { retrievePlaylistsAndSongs } = SpotifyWebService();
    const { calculateSongTimeRangePercentage, calculateAverageDateAdded,
            calculateMostPlayedByTimeRangePercentage, calculateSavedSongPercentage, calculateTimesRecentlyPlayed,
            calculateAverageReleaseDate, calculateAverageSongPopularity,
            calculateMostFrequentArtist, calculateArtistDiversity,
            calculateAverageSongDuration,
            calculateSongDurationVariance } = useCalculatePlaylistStatsService();
    const {
        // Maintenance
        calculateSongCountScore, calculateTwoYearOldPercentageScore, calculateAvgSongAddedDateScore,
        calculateLastSongAddedDateScore, calculateTotalMaintenanceScore,
        // User Relevance
        calculateShortTermMostPlayedPercentageScore, calculateMediumTermMostPlayedPercentageScore, calculateLongTermMostPlayedPercentageScore,
        calculateSavedSongPercentageScore, calculateTimesRecentlyPlayedScore, calculateTotalUserRelevanceScore,
        // General Relevance
        calculateAvgSongReleaseDateScore, calculateAvgSongPopularityScore, calculateTotalGeneralRelevanceScore,
        // Artist Diversity
        calculateArtistDiversityScore, calculateTotalArtistDiversityScore,
        // Song Likeness
        calculateSongDurationVarianceScore, calculateTotalSongLikenessScore,
        // Final Meta
        calculateFinalMetaStat } = useCalculatePlaylistScoresService();


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
     * withSongs
     * Utility wrapper that calculates stats with non-empty song lists
     */
    const withSongs = (songs, fn) => {
        return songs.length > 0 ? fn(songs) : "N/A";
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
                maintenance: {
                    songCount: songs.length,
                    twoYearOldPercentage: withSongs(songs, (s) => calculateSongTimeRangePercentage(s, dates.twoThousandNewYears, dates.twoYearsAgo)),
                    sixMonthNewPercentage: withSongs(songs, (s) => calculateSongTimeRangePercentage(s, dates.sixMonthsAgo, dates.zeroDaysAgo)),
                    avgSongAddedDate: withSongs(songs, calculateAverageDateAdded),
                    lastSongAddedDate: withSongs(songs, (s) => s[s.length - 1].added_at),
                },
                userRelevance: {
                    shortTermMostPlayedPercentage: withSongs(songs, (s) => calculateMostPlayedByTimeRangePercentage(s, topSongs["short_term"])),
                    mediumTermMostPlayedPercentage: withSongs(songs, (s) => calculateMostPlayedByTimeRangePercentage(s, topSongs["medium_term"])),
                    longTermMostPlayedPercentage: withSongs(songs, (s) => calculateMostPlayedByTimeRangePercentage(s, topSongs["long_term"])),
                    savedSongPercentage: withSongs(songs, (s) => calculateSavedSongPercentage(s, savedSongs)),
                    timesRecentlyPlayed: withSongs(songs, (s) => calculateTimesRecentlyPlayed(s, recentlyPlayedSongs)),
                },
                generalRelevance: {
                    avgSongReleaseDate: withSongs(songs, calculateAverageReleaseDate),
                    avgSongPopularity: withSongs(songs, calculateAverageSongPopularity),
                },
                artistStats: {
                    artistDiversity: withSongs(songs, calculateArtistDiversity),
                    mostFrequentArtistByPercentage: withSongs(songs, (s) => calculateMostFrequentArtist(s, false)),
                    // mostFrequentArtistByCount: withSongs(songs, (s) => calculateMostFrequentArtist(s, true)),
                },
                songStats: {
                    avgSongDuration: withSongs(songs, calculateAverageSongDuration),
                },
                advancedSongStats: {
                    songDurationVariance: withSongs(songs, calculateSongDurationVariance),
                },
            };
        });

        return stats;
    };

    /*
     * calculatePlaylistScores
     * Calculates all necessary playlist scores
     */
    const computePlaylistScores = (playlists, playlistStats) => {
        const scores = {};

        playlists.forEach((playlist) => {
            const playlistId = playlist.id;

            // --- Maintenance Scores ---
            const songCountScore = calculateSongCountScore(
                playlistStats[playlistId]["maintenance"]["songCount"]
            );
            const twoYearOldPercentageScore = calculateTwoYearOldPercentageScore(
                playlistStats[playlistId]["maintenance"]["twoYearOldPercentage"]
            );
            const avgSongAddedDateScore = calculateAvgSongAddedDateScore(
                playlistStats[playlistId]["maintenance"]["avgSongAddedDate"]
            );
            const lastSongAddedDateScore = calculateLastSongAddedDateScore(
                playlistStats[playlistId]["maintenance"]["lastSongAddedDate"]
            );

            // --- User Relevance Scores ---
            const shortTermMostPlayedPercentageScore = calculateShortTermMostPlayedPercentageScore(
                playlistStats[playlistId]["userRelevance"]["shortTermMostPlayedPercentage"]
            );
            const mediumTermMostPlayedPercentageScore = calculateMediumTermMostPlayedPercentageScore(
                playlistStats[playlistId]["userRelevance"]["mediumTermMostPlayedPercentage"]
            );
            const longTermMostPlayedPercentageScore = calculateLongTermMostPlayedPercentageScore(
                playlistStats[playlistId]["userRelevance"]["longTermMostPlayedPercentage"]
            );
            const savedSongPercentageScore = calculateSavedSongPercentageScore(
                playlistStats[playlistId]["userRelevance"]["savedSongPercentage"]
            );
            const timesRecentlyPlayedScore = calculateTimesRecentlyPlayedScore(
                playlistStats[playlistId]["userRelevance"]["timesRecentlyPlayed"]
            );

            // --- General Relevance Scores ---
            const avgSongReleaseDateScore = calculateAvgSongReleaseDateScore(
                playlistStats[playlistId]["generalRelevance"]["avgSongReleaseDate"]
            );
            const avgSongPopularityScore = calculateAvgSongPopularityScore(
                playlistStats[playlistId]["generalRelevance"]["avgSongPopularity"]
            );

            // --- Artist Diversity Scores ---
            const artistDiversityScore = calculateArtistDiversityScore(
                playlistStats[playlistId]["artistStats"]["artistDiversity"]
            );

            // --- Song Likeness Scores ---
            const songDurationVarianceScore = calculateSongDurationVarianceScore(
                playlistStats[playlistId]["advancedSongStats"]["songDurationVariance"]
            );

            // --- Assign Scores Object ---
            scores[playlistId] = {
                maintenanceScores: {
                    songCountScore,
                    twoYearOldPercentageScore,
                    avgSongAddedDateScore,
                    lastSongAddedDateScore,
                    totalMaintenanceScore: calculateTotalMaintenanceScore(
                        songCountScore,
                        twoYearOldPercentageScore,
                        avgSongAddedDateScore,
                        lastSongAddedDateScore
                    )
                },
                userRelevanceScores: {
                    shortTermMostPlayedPercentageScore,
                    mediumTermMostPlayedPercentageScore,
                    longTermMostPlayedPercentageScore,
                    savedSongPercentageScore,
                    timesRecentlyPlayedScore,
                    totalUserRelevanceScore: calculateTotalUserRelevanceScore(
                        shortTermMostPlayedPercentageScore,
                        mediumTermMostPlayedPercentageScore,
                        longTermMostPlayedPercentageScore,
                        savedSongPercentageScore,
                        timesRecentlyPlayedScore
                    )
                },
                generalRelevanceScores: {
                    avgSongReleaseDateScore,
                    avgSongPopularityScore,
                    totalGeneralRelevanceScore: calculateTotalGeneralRelevanceScore(
                        avgSongReleaseDateScore,
                        avgSongPopularityScore
                    )
                },
                artistDiversityScores: {
                    artistDiversityScore,
                    totalArtistDiversityScore: calculateTotalArtistDiversityScore(
                        artistDiversityScore
                    )
                },
                songLikenessScores: {
                    songDurationVarianceScore,
                    totalSongLikenessScore: calculateTotalSongLikenessScore(
                        songDurationVarianceScore
                    )
                },
                totalScore: calculateFinalMetaStat(playlistStats[playlistId])
            };
        });

        return scores;
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
                const playlistScores = computePlaylistScores(playlists, playlistStats);

            return { playlists, playlistSongs, playlistStats, playlistScores }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrieveAllData }
}

export default MySPStatsService;