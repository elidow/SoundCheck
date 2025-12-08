/* PlaylistDataManagerService */

import { useMemo } from 'react';
import SpotifyWebService from '../spotify/SpotifyWebService';
import useCalculatePlaylistStatsService from '../analytics/CalculatePlaylistStatsService';
import useCalculatePlaylistScoresService from '../analytics/CalculatePlaylistScoresService';

/*
 * PlaylistDataManagerService
 * Functional component to manage all relevant playlist data and statistics
 */
const PlaylistDataManagerService = () => {
    const { retrievePlaylistsAndSongs } = SpotifyWebService();
    const { calculateSongTimeRangePercentage, calculateAverageSongDateAdded,
            calculateMostPlayedByTimeRangePercentage, calculateSavedSongPercentage, calculateTimesRecentlyPlayed,
            calculateAverageSongReleaseDate, calculateAverageSongPopularity,
            calculateMostFrequentArtist, calculateArtistDiversity,
            calculateAverageSongDuration,
            calculateSongDurationVariance, calculateSongReleaseDateVariance } = useCalculatePlaylistStatsService();
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
        calculateSongDurationVarianceScore, calculateSongReleaseDateVarianceScore, calculateTotalSongLikenessScore,
        // Total Score
        calculateTotalScore } = useCalculatePlaylistScoresService();

    /*
     * addSavedSongs
     * Marks songs that are saved in user's library
     */
    const addSavedSongs = (playlistSongs, savedSongs) => {
        for (let playlistId in playlistSongs) {
            playlistSongs[playlistId] = playlistSongs[playlistId].map(song => ({
                ...song,
                isSaved: savedSongs.some(savedSong => savedSong.track.id === song.track.id)
            }));
        }
    };

    /*
     * addTopSongs
     * Marks songs that are in short/medium/long_term top songs
     */
    const addTopSongs = (playlistSongs, topSongs) => {
        for (let playlistId in playlistSongs) {
            playlistSongs[playlistId] = playlistSongs[playlistId].map(song => ({
                ...song,
                isTopShortTerm: topSongs["short_term"].some(topSong => topSong.id === song.track.id),
                isTopMediumTerm: topSongs["medium_term"].some(topSong => topSong.id === song.track.id),
                isTopLongTerm: topSongs["long_term"].some(topSong => topSong.id === song.track.id)
            }));
        }
    };

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
                    avgSongAddedDate: withSongs(songs, calculateAverageSongDateAdded),
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
                    avgSongReleaseDate: withSongs(songs, calculateAverageSongReleaseDate),
                    avgSongPopularity: withSongs(songs, calculateAverageSongPopularity),
                },
                artistStats: {
                    artistDiversity: withSongs(songs, calculateArtistDiversity),
                    mostFrequentArtistByCount: withSongs(songs, (s) => calculateMostFrequentArtist(s, true)),
                    mostFrequentArtistByPercentage: withSongs(songs, (s) => calculateMostFrequentArtist(s, false)),
                },
                songStats: {
                    avgSongDuration: withSongs(songs, calculateAverageSongDuration),
                },
                advancedSongStats: {
                    songDurationVariance: withSongs(songs, calculateSongDurationVariance),
                    songReleaseDateVariance: withSongs(songs, calculateSongReleaseDateVariance)
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

            const totalMaintenanceScore = calculateTotalMaintenanceScore(
                songCountScore, twoYearOldPercentageScore, avgSongAddedDateScore, lastSongAddedDateScore
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

            const totalUserRelevanceScore = calculateTotalUserRelevanceScore(
                shortTermMostPlayedPercentageScore, mediumTermMostPlayedPercentageScore, longTermMostPlayedPercentageScore,
                savedSongPercentageScore, timesRecentlyPlayedScore
            );

            // --- General Relevance Scores ---
            const avgSongReleaseDateScore = calculateAvgSongReleaseDateScore(
                playlistStats[playlistId]["generalRelevance"]["avgSongReleaseDate"]
            );
            const avgSongPopularityScore = calculateAvgSongPopularityScore(
                playlistStats[playlistId]["generalRelevance"]["avgSongPopularity"]
            );

            const totalGeneralRelevanceScore = calculateTotalGeneralRelevanceScore(
                avgSongReleaseDateScore, avgSongPopularityScore
            );

            // --- Artist Diversity Scores ---
            const artistDiversityScore = calculateArtistDiversityScore(
                playlistStats[playlistId]["artistStats"]["artistDiversity"]
            );

            const totalArtistDiversityScore = calculateTotalArtistDiversityScore(
                artistDiversityScore
            );

            // --- Song Likeness Scores ---
            const songDurationVarianceScore = calculateSongDurationVarianceScore(
                playlistStats[playlistId]["advancedSongStats"]["songDurationVariance"]
            );

            const songReleaseDateVarianceScore = calculateSongReleaseDateVarianceScore(
                playlistStats[playlistId]["advancedSongStats"]["songReleaseDateVariance"]
            );

            const totalSongLikenessScore = calculateTotalSongLikenessScore(
                songDurationVarianceScore, songReleaseDateVarianceScore
            );

            // --- Assign Scores Object ---
            scores[playlistId] = {
                maintenanceScores: {
                    songCountScore,
                    twoYearOldPercentageScore,
                    avgSongAddedDateScore,
                    lastSongAddedDateScore,
                    totalMaintenanceScore
                },
                userRelevanceScores: {
                    shortTermMostPlayedPercentageScore,
                    mediumTermMostPlayedPercentageScore,
                    longTermMostPlayedPercentageScore,
                    savedSongPercentageScore,
                    timesRecentlyPlayedScore,
                    totalUserRelevanceScore
                },
                generalRelevanceScores: {
                    avgSongReleaseDateScore,
                    avgSongPopularityScore,
                    totalGeneralRelevanceScore
                },
                artistDiversityScores: {
                    artistDiversityScore,
                    totalArtistDiversityScore
                },
                songLikenessScores: {
                    songDurationVarianceScore,
                    songReleaseDateVarianceScore,
                    totalSongLikenessScore
                },
                totalScore: calculateTotalScore(
                    totalMaintenanceScore,
                    totalUserRelevanceScore,
                    totalGeneralRelevanceScore,
                    totalArtistDiversityScore,
                    totalSongLikenessScore
                )
            };
        });

        return scores;
    };


    /*
     * calculateMostPopularMedia
     * Calculates most popular artist and song across all playlists
     */
    const calculateMostPopularMedia = (playlists, playlistSongs) => {
        const artistCount = {};
        const songCount = {};

        playlists.forEach((pl) => {
            const songs = playlistSongs[pl.id] || [];
            songs.forEach((song) => {
                artistCount[song.track.artists[0].name] = (artistCount[song.track.artists[0].name] || 0) + 1;
                songCount[song.track.name] = (songCount[song.track.name] || 0) + 1;
            });
        });

        let mostPopularArtist = null;
        let highestArtistCount = -1;
        let mostPopularSong = null;
        let highestSongCount = -1;

        for (let artist in artistCount) {
            if (artistCount[artist] > highestArtistCount) {
                highestArtistCount = artistCount[artist];
                mostPopularArtist = artist;
            }
        }

        for (let song in songCount) {
            if (songCount[song] > highestSongCount) {
                highestSongCount = songCount[song];
                mostPopularSong = song;
            }
        }

        let mostPopularArtistResult = `${mostPopularArtist}: ${highestArtistCount}`;
        let mostPopularSongResult = `${mostPopularSong}: ${highestSongCount}`;

        return { mostPopularArtistResult, mostPopularSongResult};
    };

    /*
     * calculateHightestTotalScoringPlaylists
     * Calculates highest total scoring playlist
     */
    const calculateHighestTotalScoringPlaylists = (playlists, playlistScores) => {
        let highestScore = -1;
        let highestScoringPlaylist = null;

        playlists.forEach((pl) => {
            const plScore = playlistScores[pl.id]?.totalScore || 0;
            if (plScore > highestScore) {
                highestScore = plScore;
                highestScoringPlaylist = pl;
            }
        });

        let highestTotalScorePlaylistResult = `${highestScoringPlaylist.name}: ${highestScore}`;

        return highestTotalScorePlaylistResult;
    };

    /*
     * calculateAverageTotalPlaylistScore
     * Calculates average total playlist score
     */
    const calculateAverageTotalPlaylistScore = (playlists, playlistScores) => {
        let totalScore = 0;

        playlists.forEach((pl) => {
            totalScore += Number(playlistScores[pl.id]?.totalScore) || 0;
        });

        return playlists.length > 0 ? (totalScore / playlists.length).toFixed(2) : "N/A";
    };

    /*
     * computeMetaStats
     * Calculates all necessary playlist meta statistics
     */
    const computeMetaStats = (playlists, playlistSongs, savedSongs, playlistScores, userProfile) => {
        const metaStats = {};
        const { mostPopularArtistResult, mostPopularSongResult } = calculateMostPopularMedia(playlists, playlistSongs);

        metaStats["Profile Pic"] = userProfile?.images?.length > 0 ? userProfile.images[0].url : null;
        metaStats["Username"] = userProfile?.display_name || "N/A";
        metaStats["Playlist Count"] = playlists.length;
        metaStats["Saved Song Count"] = savedSongs.length;
        metaStats["Most Popular Artist"] = mostPopularArtistResult;
        metaStats["Most Popular Song"] = mostPopularSongResult;
        metaStats["Highest Total Scoring Playlist"] = calculateHighestTotalScoringPlaylists(playlists, playlistScores);
        metaStats["Average Total Scoring Playlist"] = calculateAverageTotalPlaylistScore(playlists, playlistScores);

        console.log("Meta Stats:", metaStats);

        return metaStats;
    };

    /*
     * retrievePlaylistsWithStats
     * Custom react hook used to interact with Spotify Web API client and calculate playlist statistics
     */
    const retrieveAllData = async () => {
        try {
                const { playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs, userProfile } = await retrievePlaylistsAndSongs();
                addSavedSongs(playlistSongs, savedSongs);
                addTopSongs(playlistSongs, topSongs);

                const dates = getDates();

                const playlistStats = computePlaylistStats(playlists, playlistSongs, topSongs, savedSongs, recentlyPlayedSongs, dates);
                const playlistScores = computePlaylistScores(playlists, playlistStats);
                const metaStats = computeMetaStats(playlists, playlistSongs, savedSongs, playlistScores, userProfile);

            return { playlists, playlistSongs, playlistStats, playlistScores, metaStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrieveAllData }
}

export default PlaylistDataManagerService;