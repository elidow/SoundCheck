import { useCallback } from 'react';

const useCalculatePlaylistScoresService = () => {

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

    return { calculateFinalMetaStat };
}

export default useCalculatePlaylistScoresService;