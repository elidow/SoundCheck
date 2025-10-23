import { useCallback } from 'react';

/*
 * useCalculatePlaylistScoresService
 * Custom hook to handle all score calculations
 */
// applyLogisticDecay is used by multiple callbacks; define it before they are declared
function applyLogisticDecay(x, k, midpoint) {
    const score = 100 / (1 + Math.exp(k * (x - midpoint)));
    return Math.round(score);
}

const useCalculatePlaylistScoresService = () => {

    // --- Maintenance ---

    /*
     * calculateSongCountScore
     * Calculates score 0-100 on the how many songs the playlist has
     * Calculation: 70 is 100, <=20 is 0, >= 120 is 0 
     */
    const calculateSongCountScore = useCallback((count) => {
        if (count >= 70 && count <= 80) {
            return 100;
        }

        // Distance to the nearest boundary of [70, 80]
        const distance = count < 70 ? 70 - count : count - 80;

        const score = 100 - (2 * distance);

        return Math.max(score, 0);
    }, []);

    /*
     * calculateTwoYearOldPercentageScore
     * Calculates score 0-100 on the how many songs have two year old songs
     * Calculation: %
     */
    const calculateTwoYearOldPercentageScore = useCallback((percentage) => {
        const val = Math.round(100 - Number(percentage));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
    * calculateAvgSongAddedDateScore
    * Calculates score 0-100 based on average song added date.
    * Target tuning (approximate):
    *  - ~95 at 90 days
    *  - ~80 at 365 days
    *  - 50 (midpoint) at 638 days
    *  - near 0 by ~730 days (clamped)
    */
    const calculateAvgSongAddedDateScore = useCallback((date) => {
        const inputDate = new Date(date);
        const today = new Date();

        const daysDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24)); // difference in days
    const x = Math.max(daysDiff, 0);
    const midpoint = Math.round(1.5 * 365);
    const zeroClamp = Math.round(2 * 365);
    const k = 0.012;

    if (x >= zeroClamp) return 0;

    return applyLogisticDecay(x, k, midpoint);
    }, []);

    /*
     * calculateLastSongAddedDateScore
     * Calculates score 0-100 on what the last song added date is
     * Target tuning (approximate):
     *  - ~95 at 45 days
     *  - ~80 at 180 days
     *  - 50 (midpoint) at 270 days
     *  - near 0 by ~365 days (clamped)
     */
    const calculateLastSongAddedDateScore = useCallback((date) => {
        const inputDate = new Date(date);
        const today = new Date();
        
        const daysDiff = Math.floor((today - inputDate) / (1000 * 60 * 60 * 24)); // difference in days
    const x = Math.max(daysDiff, 0);
    const midpoint = Math.round(0.5 * 365);
    const zeroClamp = 9 * 30;
    const k = 0.03;

    if (x >= zeroClamp) return 0;

    return applyLogisticDecay(x, k, midpoint);
    }, []);

    /*
     * calculateTotalMaintenanceScore
     * Calculates score 0-100 on how well maintained the playlist is
     * Calculation: %
     */
    const calculateTotalMaintenanceScore = useCallback((songCountScore, twoYearOldPercentageScore, avgSongAddedDateScore, lastSongAddedDateScore) => {
        let temp = (songCountScore * (10/35)) 
            + (twoYearOldPercentageScore * (10/35)) 
            + (avgSongAddedDateScore * (10/35)) 
            + (lastSongAddedDateScore * (5/35));
        
        return Number(temp).toFixed(1);
    }, []);

    // --- User Relevance ---

    /*
     * calculateShortTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in short term most recently played
     * Calculation: %
     */
    const calculateShortTermMostPlayedPercentageScore = useCallback((percent) => {
        if (Number(percent) > 20) {
            return 100;
        }
        const val = Math.round(5 * Number(percent));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateMediumTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in medium term most recently played
     * Calculation: %
     */
    const calculateMediumTermMostPlayedPercentageScore = useCallback((percent) => {
        if (Number(percent) > 25) {
            return 100;
        }
        const val = Math.round(4 * Number(percent));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateLongTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in long term most recently played
     * Calculation: %
     */
    const calculateLongTermMostPlayedPercentageScore = useCallback((percent) => {
        if (Number(percent) > 50) {
            return 100;
        }
        const val = Math.round(2 * Number(percent));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateSavedSongPercentageScore
     * Calculates score 0-100 on the how many songs appear in saved songs
     * Calculation: %
     */
    const calculateSavedSongPercentageScore = useCallback((percent) => {
        const val = Math.round(Number(percent));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateTimesRecentlyPlayedScore
     * Calculates score 0-100 on how many times the playlist was recently played
     * Calculation: %
     */
    const calculateTimesRecentlyPlayedScore = useCallback((count) => {
        if(Number(count) > 1) {
            return 100;
        } else if(Number(count) > 0) {
            return 90;
        }

        return 0;
    }, []);

    /*
     * calculateTotalUserRelevanceScore
     * Calculates score 0-100 on how relevant the playlist is the user's activity
     */
    const calculateTotalUserRelevanceScore = useCallback((shortTermMostPlayedPercentageScore, mediumTermMostPlayedPercentageScore,
                                            longTermMostPlayedPercentageScore, savedSongPercentageScore, timesRecentlyPlayedScore) => {
        let temp = (shortTermMostPlayedPercentageScore * (10/35)) 
            + (mediumTermMostPlayedPercentageScore * (10/35)) 
            + (longTermMostPlayedPercentageScore * (5/35))
            + (savedSongPercentageScore * (5/35)) 
            + (timesRecentlyPlayedScore * (5/35));
        
        return Number(temp).toFixed(1);
    }, []);

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
        const fiveYearsAgo = formatDate(new Date(today.getFullYear() - 5, today.getMonth(), today.getDate()));
        const tenYearsAgo = formatDate(new Date(today.getFullYear() - 10, today.getMonth(), today.getDate()));
        const twentyYearsAgo = formatDate(new Date(today.getFullYear() - 20, today.getMonth(), today.getDate()));
        const thirtyYearsAgo = formatDate(new Date(today.getFullYear() - 30, today.getMonth(), today.getDate()));
        const fortyYearsAgo = formatDate(new Date(today.getFullYear() - 40, today.getMonth(), today.getDate()));
        const fiftyYearsAgo = formatDate(new Date(today.getFullYear() - 50, today.getMonth(), today.getDate()));
        
        if (date >= fiveYearsAgo) {
            return 100
        } else if (date >= tenYearsAgo) {
            return 90
        } else if (date >= twentyYearsAgo) {
            return 80
        } else if (date >= thirtyYearsAgo) {
            return 70
        } else if (date >= fortyYearsAgo) {
            return 60
        } else if (date >= fiftyYearsAgo) {
            return 50
        } else {
            return 0
        }
    }, []);

    /*
     * calculateAvgSongPopularityScore
     * Calculates score 0-100 on how popular the average song is
     */
    const calculateAvgSongPopularityScore = useCallback((popularity) => {
        const val = Math.round(Number(popularity));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateTotalGeneralRelevanceScore
     * Calculates score 0-100 on how relevant the playlist is the based on popularity and recency
     */
    const calculateTotalGeneralRelevanceScore = useCallback((avgSongReleaseDateScore, avgSongPopularityScore) => {
        let temp = (avgSongReleaseDateScore * (1/3)) 
            + (avgSongPopularityScore * (2/3))
        
        return Number(temp).toFixed(1);
    }, []);

    // --- Artist Diversity ---

    /*
     * calculateArtistDiversityScore
     * Calculates score 0-100 on how diverse the playlist is by artist
     */
    const calculateArtistDiversityScore = useCallback((diversity) =>  {
        const val = Math.round(Number(diversity));
        return Math.max(0, Math.min(100, val));
    }, []);

    /*
     * calculateTotalArtistDiversityScore
     * Calculates score 0-100 on how diverse the playlist is by artist
     * May add more but just artist diversity for now
     */
    const calculateTotalArtistDiversityScore = useCallback((artistDiversityScore) => {        
        return Number(artistDiversityScore).toFixed(1);
    }, []);

    /*
     * calculateSongDurationVarianceScore
     * Calculates score 0-100 on the variance of the song length
     * closer to 0 is better
     */
    const calculateSongDurationVarianceScore = useCallback((variance) =>  {
        let temp = 100 - Number(variance) * 100;
        temp = Math.round(temp);
        return Math.max(0, Math.min(100, temp));
    }, []);

    /*
     * calculateSongReleaseDateVarianceScore
     * Calculates score 0-100 on the variance of the song release date
     * closer to 0 is better
     */
    const calculateSongReleaseDateVarianceScore = useCallback((variance) =>  {
        let temp = 100 - Number(variance) * 100;
        temp = Math.round(temp);
        return Math.max(0, Math.min(100, temp));
    }, []);

    /*
     * calculateTotalSongLikenessScore
     * Calculates score 0-100 on how simiar the songs are
     * May add more but just song duration variance for now
     */
    const calculateTotalSongLikenessScore = useCallback((songDurationVarianceScore, songReleaseDateVariance) => {        
        let temp = (songDurationVarianceScore * (1/2)) 
            + (songReleaseDateVariance * (1/2))
        
        return Number(temp).toFixed(1);
    }, []);

    /*
     * calculateTotalScore
     * Calculates score 0-100 based on all the other scores
     */
    const calculateTotalScore = useCallback((totalMaintenanceScore, totalUserRelevanceScore, totalGeneralRelevanceScore, totalArtistDiversityScore, totalSongLikenessScore) => {
        let temp = (totalMaintenanceScore * (35/100)) 
            + (totalUserRelevanceScore * (35/100)) 
            + (totalGeneralRelevanceScore * (10/100)) 
            + (totalArtistDiversityScore * (10/100))
            + (totalSongLikenessScore * (10/100));
        
        return Number(temp).toFixed(1);
    }, []);

    // note: applyLogisticDecay is defined at module top-level and reused here

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
        calculateSongDurationVarianceScore, calculateSongReleaseDateVarianceScore, calculateTotalSongLikenessScore,
        // Total Score
        calculateTotalScore };
}

export default useCalculatePlaylistScoresService;