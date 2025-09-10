import { useCallback } from 'react';

const useCalculatePlaylistScoresService = () => {

    // const maintenanceScoreWeight = 0.35;
    // const userRelevanceScoreWeight = 0.35;
    // const generalRelevanceScoreWeight = 0.1;
    // const artistDiversityScoreWeight = 0.1;
    // const songLikenessScoreWeight = 0.1;

    // constSongCountScoreWeight = 10;
    // constTwoYearOldPercentageScoreWeight = 10;
    // constAvgSongAddedDateScoreWeight = 10;
    // constLastSongAddedDateScoreWeight = 5;

    // --- User Relevance ---

    /*
     * calculateSongCountScore
     * Calculates score 0-100 on the how many songs the playlist has
     * Calculation: 70 is 100, <=20 is 0, >= 120 is 0 
     */
    const calculateSongCountScore = useCallback((count) => {
        if(count < 20 || count > 120) {
            return 0;
        }

        return 100 - (2 * Math.abs(count - 70))
    });

    /*
     * calculateTwoYearOldPercentageScore
     * Calculates score 0-100 on the how many songs have two year old songs
     * Calculation: %
     */
    const calculateTwoYearOldPercentageScore = useCallback((percentage) => {
        return 100 - Number(percentage)
    });

    /*
     * calculateAvgSongAddedDateScore
     * Calculates score 0-100 on what the average song added date is
     * Calculation: % decay 
     */
    const calculateAvgSongAddedDateScore = useCallback((date) => {
        const inputDate = new Date(date);
        const today = new Date();
        
        // difference in days
        const daysDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
        
        // 0 to 365 clamp
        const x = Math.min(Math.max(daysDiff, 0), 365);

        // Logistic parameters tuned so:
        // ~95 at 30 days
        // ~80 at 90 days
        // ~50 at 180 days
        // ~0 at 365 days
        const k = 0.025;  // steepness
        const midpoint = 200; // where it crosses ~50
        const score = 100 / (1 + Math.exp(k * (x - midpoint)));

        return Math.round(score);
    });

    /*
     * calculateLastSongAddedDateScore
     * Calculates score 0-100 on what the last song added date is
     * Calculation: % decay 
     */
    const calculateLastSongAddedDateScore = useCallback((date) => {
        const inputDate = new Date(date);
        const today = new Date();
        
        // difference in days
        const daysDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24));
        
        // 0 to 365 clamp
        const x = Math.min(Math.max(daysDiff, 0), 365);

        // Logistic parameters tuned so:
        // ~95 at 30 days
        // ~80 at 90 days
        // ~50 at 180 days
        // ~0 at 365 days
        const k = 0.025;  // steepness
        const midpoint = 200; // where it crosses ~50
        const score = 100 / (1 + Math.exp(k * (x - midpoint)));

        return Math.round(score);
    });

    /*
     * calculateTotalMaintenanceScore
     * Calculates score 0-100 on how well maintained the playlist is
     * Calculation: %
     */
    const calculateTotalMaintenanceScore = useCallback((songCountScore, twoYearOldPercentageScore, avgSongAddedDateScore, lastSongAddedDateScore) => {
        const temp = (songCountScore * (10/35)) 
            + (twoYearOldPercentageScore * (10/35)) 
            + (avgSongAddedDateScore * (10/35)) 
            + (lastSongAddedDateScore * (5/35));
        
        return temp.toFixed(1);
    });

    // --- User Relevance ---

    /*
     * calculateShortTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in short term most recently played
     * Calculation: %
     */
    const calculateShortTermMostPlayedPercentageScore = useCallback((percent) => {
        if (Number(percent) > 50) {
            return 100;
        }
        
        return 2 * Number(percent);
    });

    /*
     * calculateMediumTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in medium term most recently played
     * Calculation: %
     */
    const calculateMediumTermMostPlayedPercentageScore = useCallback((percent) => {
        if (Number(percent) > 66.66) {
            return 100;
        }
        
        return 1.5 * Number(percent);
    });

    /*
     * calculateLongTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in long term most recently played
     * Calculation: %
     */
    const calculateLongTermMostPlayedPercentageScore = useCallback((percent) => {
        return Number(percent);
    });

    /*
     * calculateSavedSongPercentageScore
     * Calculates score 0-100 on the how many songs appear in saved songs
     * Calculation: %
     */
    const calculateSavedSongPercentageScore = useCallback((percent) => {
        return Number(percent);
    });

    /*
     * calculateTimesRecentlyPlayedScore
     * Calculates score 0-100 on how many times the playlist was recently played
     * Calculation: %
     */
    const calculateTimesRecentlyPlayedScore = useCallback((count) => {
        if(Number(count) > 0) {
            return 100;
        }

        return 0;
    });

    /*
     * calculateTotalUserRelevanceScore
     * Calculates score 0-100 on how relevant the playlist is the user's activity
     */
    const calculateTotalUserRelevanceScore = useCallback((shortTermMostPlayedPercentageScore, mediumTermMostPlayedPercentageScore,
                                            longTermMostPlayedPercentageScore, savedSongPercentageScore, timesRecentlyPlayedScore) => {
        const temp = (shortTermMostPlayedPercentageScore * (10/35)) 
            + (mediumTermMostPlayedPercentageScore * (10/35)) 
            + (longTermMostPlayedPercentageScore * (5/35))
            + (savedSongPercentageScore * (5/35)) 
            + (timesRecentlyPlayedScore * (5/35));
        
        return temp.toFixed(1);
    });

    // --- General Relevance ---

    /*
     * calculateAvgSongAddedDateScore
     * Calculates score 0-100 on what the average song release date is
     * Calculation: % decay 
     */
    const calculateAvgSongReleaseDateScore = useCallback((date) => {
        // Initialize and format dates
        const formatDate = (date) =>
            date.toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
        const today = new Date();
        const tenYearsAgo = formatDate(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()));
        const twentyYearsAgo = formatDate(new Date(today.getFullYear() - 20, today.getMonth(), today.getDate()));
        const thirtyYearsAgo = formatDate(new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()));
        const fortyYearsAgo = formatDate(new Date(today.getFullYear() - 40, today.getMonth(), today.getDate()));
        const fiftyYearsAgo = formatDate(new Date(today.getFullYear() - 50, today.getMonth(), today.getDate()));
        const sixtyYearsAgo = formatDate(new Date(today.getFullYear() - 60, today.getMonth(), today.getDate()));
        
        if (date >= tenYearsAgo) {
            return 100
        } else if (date >= twentyYearsAgo) {
            return 80
        } else if (date >= thirtyYearsAgo) {
            return 60
        } else if (date >= fortyYearsAgo) {
            return 40
        } else if (date >= fiftyYearsAgo) {
            return 20
        } else {
            return 0
        }
    });

    /*
     * calculateAvgSongPopularityScore
     * Calculates score 0-100 on how popular the average song is
     */
    const calculateAvgSongPopularityScore = useCallback((popularity) => {
        return Number(popularity);
    });

    /*
     * calculateTotalGeneralRelevanceScore
     * Calculates score 0-100 on how relevant the playlist is the based on popularity and recency
     */
    const calculateTotalGeneralRelevanceScore = useCallback((avgSongReleaseDateScore, avgSongPopularityScore) => {
        const temp = (avgSongReleaseDateScore * (1/2)) 
            + (avgSongPopularityScore * (1/2))
        
        return temp.toFixed(1);
    });

    // --- Artist Diversity ---

    /*
     * calculateArtistDiversityScore
     * Calculates score 0-100 on how diverse the playlist is by artist
     */
    const calculateArtistDiversityScore = useCallback((diversity) =>  {
        return Number(diversity);
    });

    /*
     * calculateTotalArtistDiversityScore
     * Calculates score 0-100 on how diverse the playlist is by artist
     * May add more but just artist diversity for now
     */
    const calculateTotalArtistDiversityScore = useCallback((artistDiversityScore) => {        
        return artistDiversityScore.toFixed(1);
    });

    /*
     * calculateArtistDiversityScore
     * Calculates score 0-100 on the variance of the song length
     * closer to 0 is better
     */
    const calculateSongDurationVarianceScore = useCallback((variance) =>  {
        return 100 - Number(variance) * 100;
    });

    /*
     * calculateTotalSongLikenessScore
     * Calculates score 0-100 on how simiar the songs are
     * May add more but just song duration variance for now
     */
    const calculateTotalSongLikenessScore = useCallback((songDurationVarianceScore) => {        
        return songDurationVarianceScore.toFixed(1);
    });

    const calculateFinalMetaStat = useCallback((playlistStats) => {
        let twoYearsScore = 0
        let sixMonthsScore = 0
        let lastAddedDateScore = 0
        let avgAddedDateScore = 0
        let shortTermPercentageScore = 0
        let mediumTermPercentageScore = 0
        let longTermPercentageScore = 0
        let savedSongPercentageScore = 0
        let songCountScore = 0
        let artistDiversityScore = 0

        // Initialize and format dates
        const formatDate = (date) =>
            date.toLocaleDateString("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });
        const today = new Date();
        const oneMonthAgo = formatDate(new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()));
        const threeMonthsAgo = formatDate(new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()));
        const sixMonthsAgo = formatDate(new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()));
        const oneYearAgo = formatDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()));

        // Maintenance scores
        twoYearsScore = 100 - Number(playlistStats["twoYearOldPercentage"])
        sixMonthsScore = Number(playlistStats["sixMonthNewPercentage"])

        if (playlistStats["lastSongAddedDate"] >= oneMonthAgo) {
            lastAddedDateScore = 100
        } else if (playlistStats["lastSongAddedDate"] >= threeMonthsAgo) {
            lastAddedDateScore = 75
        } else if (playlistStats["lastSongAddedDate"] >= oneYearAgo) {
            lastAddedDateScore = 50
        } else {
            lastAddedDateScore = 25
        }

        if (playlistStats["avgSongAddedDate"] >= threeMonthsAgo) {
            avgAddedDateScore = 100
        } else if (playlistStats["avgSongAddedDate"] >= sixMonthsAgo) {
            avgAddedDateScore = 75
        } else if (playlistStats["avgSongAddedDate"] >= oneYearAgo) {
            avgAddedDateScore = 50
        } else {
            avgAddedDateScore = 25
        }

        // Relevance scores
        shortTermPercentageScore = Number(playlistStats["shortTermPercentage"])
        mediumTermPercentageScore = Number(playlistStats["mediumTermPercentage"])
        longTermPercentageScore = Number(playlistStats["longTermPercentage"])
        savedSongPercentageScore = Number(playlistStats["savedSongPercentage"])

        // Size scores
        if (playlistStats["songCount"] >= 60 && playlistStats["songCount"] <= 79) {
            songCountScore = 100
        } else if(playlistStats["songCount"] >= 80 && playlistStats["songCount"] <= 99) {
            songCountScore = 75
        } else if(playlistStats["songCount"] >= 40 && playlistStats["songCount"] <= 59) {
            songCountScore = 50
        } else {
            songCountScore = 25
        }

        // Diversity scores
        artistDiversityScore = Number(playlistStats["artistDiversityScore"]);

        return ((twoYearsScore + sixMonthsScore + lastAddedDateScore + avgAddedDateScore +
            shortTermPercentageScore + mediumTermPercentageScore + longTermPercentageScore + savedSongPercentageScore +
            songCountScore + artistDiversityScore) / 10).toFixed(1);
    }, []);

    return {
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
        calculateFinalMetaStat };
}

export default useCalculatePlaylistScoresService;