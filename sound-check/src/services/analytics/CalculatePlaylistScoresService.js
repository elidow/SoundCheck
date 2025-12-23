import { useCallback } from 'react';

/*
 * normalizeNumber 
 * Helper function to normalize a number x between lowPoint and highPoint to a 0-100 scale
 */
function normalizeNumber(x, lowPoint, highPoint) {
    if (x <= lowPoint) return 0;
    if (x >= highPoint) return 100;

    return Math.floor(((x - lowPoint) / (highPoint - lowPoint)) * 100);
}

/*
 * normalizeDate
 * Helper function to normalize a date (YYYY-MM-DD) between earlyDate and lateDate to a 0-100 scale
 */
function normalizeDate(date, earlyDate, lateDate) {
    if (!isFinite(date) || !isFinite(earlyDate) || !isFinite(lateDate)) {
        return 0;
    }

    const t = date.getTime();
    const lowT = earlyDate.getTime();
    const highT = lateDate.getTime();

    if (lowT === highT) return 100;
    if (t <= lowT) return 0;
    if (t >= highT) return 100;

    const ratio = (t - lowT) / (highT - lowT);
    return Math.floor(Math.max(0, Math.min(100, ratio * 100)));
}

// applyLogisticDecay is used by multiple callbacks; define it before they are declared
function applyLogisticDecay(x, k, midpoint) {
    const score = 100 / (1 + Math.exp(k * (x - midpoint)));
    return Math.floor(score);
}

/*
 * useCalculatePlaylistScoresService
 * Custom hook to handle all score calculations
 */
const useCalculatePlaylistScoresService = () => {

    // --- Maintenance ---

    /*
     * calculateSongCountScore
     * Calculates score 0-100 on the how many songs the playlist has
     * Calculation: 70-80 is 100, 50-69/81-100 is only -1 by distance, 40-49/101-110 is -2, 20-39/111-130 is -3, beyond is 0
     */
    const calculateSongCountScore = useCallback((x) => {
        if (x >= 70 && x <= 80) return 100;

        if (x >= 50 && x <= 69) {
            const dist = 70 - x;
            return 100 - dist;
        }
        if (x >= 81 && x <= 100) {
            const dist = x - 80;
            return 100 - dist;
        }

        if (x >= 40 && x <= 49) {
            const dist = 50 - x;
            return 80 - 2 * dist;
        }
        if (x >= 101 && x <= 110) {
            const dist = x - 100;
            return 80 - 2 * dist;
        }

        if (x >= 20 && x <= 39) {
            const dist = 40 - x;
            return 60 - 3 * dist;
        }
        if (x >= 111 && x <= 130) {
            const dist = x - 110;
            return 60 - 3 * dist;
        }

        return 0;
    }, []);

    /*
     * calculateTwoYearOldPercentageScore
     * Calculates score 0-100 on the how many songs have two year old songs
     * Calculation: %
     */
    const calculateTwoYearOldPercentageScore = useCallback((percentage) => {
        const val = Math.floor(100 - Number(percentage));
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
        return normalizeNumber(Number(percent), 0, 20);
    }, []);

    /*
     * calculateMediumTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in medium term most recently played
     * Calculation: %
     */
    const calculateMediumTermMostPlayedPercentageScore = useCallback((percent) => {
        return normalizeNumber(Number(percent), 0, 25);
    }, []);

    /*
     * calculateLongTermMostPlayedPercentageScore
     * Calculates score 0-100 on the how many songs appear in long term most recently played
     * Calculation: %
     */
    const calculateLongTermMostPlayedPercentageScore = useCallback((percent) => {
        return normalizeNumber(Number(percent), 0, 50);
    }, []);

    /*
     * calculateSavedSongPercentageScore
     * Calculates score 0-100 on the how many songs appear in saved songs
     * Calculation: %
     */
    const calculateSavedSongPercentageScore = useCallback((percent) => {
        const val = Math.floor(Number(percent));
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
        const oneYearAgo = formatDate(new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()));
        const oneHundredOneYearsAgo = formatDate(new Date(today.getFullYear() - 101, today.getMonth(), today.getDate()));
        
        return normalizeDate(new Date(date), new Date(oneHundredOneYearsAgo), new Date(oneYearAgo));
    }, []);

    /*
     * calculateAvgSongPopularityScore
     * Calculates score 0-100 on how popular the average song is
     */
    const calculateAvgSongPopularityScore = useCallback((popularity) => {
        return normalizeNumber(Number(popularity), 30, 80);
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
        const val = Math.floor(Number(diversity));
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
        return 100 - normalizeNumber(Number(variance), 0, 4);
    }, []);

    /*
     * calculateSongReleaseDateVarianceScore
     * Calculates score 0-100 on the variance of the song release date
     * closer to 0 is better
     */
    const calculateSongReleaseDateVarianceScore = useCallback((variance) =>  {
        return 100 - normalizeNumber(Number(variance), 0, 400);
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