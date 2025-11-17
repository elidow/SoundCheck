import { useCallback } from 'react';
import gini from 'gini';

/*
 * useCalculatePlaylistStatsService
 * Custom hook to handle all stat calculations
 */
const useCalculatePlaylistStatsService = () => {

    /*
     * calculateSongTimeRangePercentage
     * Given a playlist's songs, calculates the percentage of songs that were added within the time range
     */
    const calculateSongTimeRangePercentage = useCallback((playlistSongs, startDate, endDate) => {
        let outdated = 0;

        for (const key in playlistSongs) {
            if (startDate < playlistSongs[key].added_at && playlistSongs[key].added_at < endDate) {
                outdated += 1;
            }
        }
        
        return Number(((outdated / playlistSongs.length) * 100).toFixed(1))
    }, []);

    /*
     * calculateAverageSongDateAdded
     * Given a playlist's songs, calculates the average added date of the songs
     */
    const calculateAverageSongDateAdded = useCallback((playlistSongs) => {

        const timestamps = playlistSongs.map(playlistSong => Date.parse(playlistSong.added_at));
        const avgTimestamp = timestamps.reduce((sum, ts) => sum + ts, 0) / timestamps.length;
        const avgDate = new Date(avgTimestamp);
        
        return avgDate.toISOString();
    }, []);

    /*
     * calculateMostPlayedByTimeRangePercentage
     * Given a playlist's songs and user's top songs in a time range,
     * Calculates the percentage of songs that appear in the top songs
     */
    const calculateMostPlayedByTimeRangePercentage = useCallback((playlistSongs, topSongs) => {
       let topSongCount = 0;
       let topSongIds = topSongs.map(song => song.id);

        for (const key in playlistSongs) {
            if (topSongIds.includes(playlistSongs[key].track.id)) {
                topSongCount += 1;
            }
        }
        
        return Number(((topSongCount / playlistSongs.length) * 100).toFixed(1))
    }, []);

    /*
     * calculateSavedSongPercentage
     * Given a playlist's songs and user's saved songs,
     * Calculates the percentage of songs that appear in the saved songs
     */
    const calculateSavedSongPercentage = useCallback((playlistSongs, savedSongs) => {
       let savedSongCount = 0;
       let savedSongIds = savedSongs.map(song => song.track.id);

        for (const key in playlistSongs) {
            if (savedSongIds.includes(playlistSongs[key].track.id)) {
                savedSongCount += 1;
            }
        }
        
        return Number(((savedSongCount / playlistSongs.length) * 100).toFixed(1))
    }, []);

    // TODO: need to confirm accurracy
    /*
     * calculateTimesRecentlyPlayed
     * Given a playlist's songs and user's recently played songs,
     * Calculates the times a playlist has been recently played
     * A play of a playlist is considered 4 songs from it in any order
     */
    const calculateTimesRecentlyPlayed = useCallback((playlistSongs, recentlyPlayedSongs) => {
        let playlistSongIds = playlistSongs.map(song => song.track.id);
        let count = 0;
        let streak = 0;
        let inPlay = false;

        for (let i = 0; i < recentlyPlayedSongs.length; i++) {
            if (playlistSongIds.includes(recentlyPlayedSongs[i].track.id)) {
                streak++;
                if (streak >= 4 && !inPlay) {
                    count++;
                    inPlay = true; // already counted this play
                }
            } else {
                streak = 0; // reset streak
                inPlay = false; // ready to detect next play
            }
        }

        return count;
    }, []);

    /*
     * calculateAverageSongReleaseDate
     * Given a playlist's songs, calculates the average release date of the songs
     */
    const calculateAverageSongReleaseDate = useCallback((playlistSongs) => {

        const timestamps = playlistSongs.map(playlistSong => Date.parse(playlistSong.track.album.release_date));
        const avgTimestamp = timestamps.reduce((sum, ts) => sum + ts, 0) / timestamps.length;
        const avgDate = new Date(avgTimestamp);
        
        return avgDate.toISOString();
    }, []);

    /*
     * calculateAverageSongPopularity
     * Given a playlist's songs, calculates the average song popularity 
     * This is a number 0 to 100 where 100 is the most popular based on overall and current popularity
     */
    const calculateAverageSongPopularity = useCallback((playlistSongs) => {

        const songPopularityScores = playlistSongs.map(playlistSong => playlistSong.track.popularity);
        const avgSongPopularityScore = songPopularityScores.reduce((sum, sps) => sum + sps, 0) / songPopularityScores.length;
        
        return Number((avgSongPopularityScore).toFixed(1));
    }, []);

    /*
     * calculateMostFrequentArtist
     * Given a playlist's songs and counting method, calculates the most frequent artist
     * True means by count, false means by percentage
     */
    const calculateMostFrequentArtist = useCallback((playlistSongs, byCount) => {
        let artistFrequency = {};
        let mostFrequentArtistByCount = {
            "artistName": 'No Artists',
            "artistCount": 0
        };

        for (const key in playlistSongs) {
            let artist = playlistSongs[key].track.artists[0].name
            if (artist in artistFrequency) {
                artistFrequency[artist] += 1;
            } else {
                artistFrequency[artist] = 1;
            }

            if(artistFrequency[artist] >= mostFrequentArtistByCount["artistCount"]) {
                mostFrequentArtistByCount["artistName"] = artist;
                mostFrequentArtistByCount["artistCount"] = artistFrequency[artist];
            }
        }

        if (!byCount) {
            mostFrequentArtistByCount["artistCount"] = ((mostFrequentArtistByCount["artistCount"] / playlistSongs.length) * 100).toFixed(1)
        }
        
        return mostFrequentArtistByCount
    }, []);

    // TODO: need to confirm accurracy
    /*
     * calculateArtistDiversity
     * Given a playlist's songs, calculates the artist diversity using the gini coefficient
     */
    const calculateArtistDiversity = useCallback((playlistSongs) => {
        let artistFrequency = {};
        let artistCount = 0;
        let richnessScore = 0;
        let distributionData = [];
        let evennessScore = 0;

        for (const key in playlistSongs) {
            let artistName = playlistSongs[key].track.artists[0].name
            if (artistName in artistFrequency) {
                artistFrequency[artistName] += 1;
            } else {
                artistFrequency[artistName] = 1;
                artistCount += 1;
            }
        }

        richnessScore = (artistCount / playlistSongs.length).toFixed(2);

        for (const key in artistFrequency) {
            distributionData.push((artistFrequency[key] / playlistSongs.length).toFixed(2));
        }

        evennessScore = gini.unordered(distributionData);
        
        return Number((richnessScore * (1 - evennessScore) * 100).toFixed(1))
    }, []);

    /*
     * calculateAverageSongDuration
     * Given a playlist's songs, calculates the average song duration in the format MM:SS
     */
    const calculateAverageSongDuration = useCallback((playlistSongs) => {

        const songDurations = playlistSongs.map(playlistSong => playlistSong.track.duration_ms);
        const avgSongDuration = songDurations.reduce((sum, sd) => sum + sd, 0) / songDurations.length;

        const minutes = Math.floor((avgSongDuration / 1000) / 60);
        const seconds = Math.floor((avgSongDuration / 1000) % 60).toString().padStart(2, '0');
        
        return `${minutes}:${seconds}`;
    }, []);

    /*
     * calculateSongDurationVariance
     * Given a playlist's songs, calculates the song duration variance in minutes
     */
    const calculateSongDurationVariance = useCallback((playlistSongs) => {

        const songDurations = playlistSongs.map(playlistSong => Number(((playlistSong.track.duration_ms / 1000) / 60).toFixed(2)));
        const mean = songDurations.reduce((sum, sd) => sum + sd, 0) / songDurations.length;

        const squaredDifferences = songDurations.map(duration => Math.pow(duration - mean, 2));
        const sumOfSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0);

        // return song duration variance
        return Number(sumOfSquaredDifferences / playlistSongs.length).toFixed(2);
    }, []);

    /*
    * calculateReleaseDateVariance
    * Given a playlist's songs, calculates the release date variance in days
    */
    const calculateSongReleaseDateVariance = useCallback((playlistSongs) => {
        // Convert YYYY-MM-DD → timestamp in days
        const releaseDates = playlistSongs
            .map(song => song.track.album.release_date)
            .filter(Boolean) // in case of missing release_date
            .map(dateStr => {
                const date = new Date(dateStr);
                return Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 365.25)); // convert to days
            });

        if (releaseDates.length === 0) {
            return 0;
        }

        const mean = releaseDates.reduce((sum, d) => sum + d, 0) / releaseDates.length;

        const squaredDifferences = releaseDates.map(d => Math.pow(d - mean, 2));
        const sumOfSquaredDifferences = squaredDifferences.reduce((acc, val) => acc + val, 0);

        // return population variance (in days²)
        return Number(sumOfSquaredDifferences / releaseDates.length).toFixed(2);
    }, []);


    return { calculateSongTimeRangePercentage, calculateAverageSongDateAdded,
            calculateMostPlayedByTimeRangePercentage, calculateSavedSongPercentage, calculateTimesRecentlyPlayed,
            calculateAverageSongReleaseDate, calculateAverageSongPopularity,
            calculateMostFrequentArtist, calculateArtistDiversity,
            calculateAverageSongDuration,
            calculateSongDurationVariance, calculateSongReleaseDateVariance
        };
}

export default useCalculatePlaylistStatsService;