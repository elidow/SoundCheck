import { useCallback } from 'react';
import gini from 'gini';

const useCalculatePlaylistStatsService = () => {

    const calculateSongTimeRangePercentage = useCallback((playlistSongs, startDate, endDate) => {
        let outdated = 0;

        for (const key in playlistSongs) {
            if (startDate < playlistSongs[key].added_at && playlistSongs[key].added_at < endDate) {
                outdated += 1;
            }
        }
        
        return ((outdated / playlistSongs.length) * 100).toFixed(1)
    }, []);

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

    const calculateAverageReleaseDate = useCallback((playlistSongs) => {

        const timestamps = playlistSongs.map(playlistSong => Date.parse(playlistSong.track.album.release_date));
        const avgTimestamp = timestamps.reduce((sum, ts) => sum + ts, 0) / timestamps.length;
        const avgDate = new Date(avgTimestamp);
        
        return avgDate.toISOString();
    }, []);

    const calculateAverageDateAdded = useCallback((playlistSongs) => {

        const timestamps = playlistSongs.map(playlistSong => Date.parse(playlistSong.added_at));
        const avgTimestamp = timestamps.reduce((sum, ts) => sum + ts, 0) / timestamps.length;
        const avgDate = new Date(avgTimestamp);
        
        return avgDate.toISOString();
    }, []);

    const calculateAverageSongDuration = useCallback((playlistSongs) => {

        const songDurations = playlistSongs.map(playlistSong => playlistSong.track.duration_ms);
        const avgSongDuration = songDurations.reduce((sum, sd) => sum + sd, 0) / songDurations.length;
        
        return ((avgSongDuration / 1000) / 60).toFixed(2);
    }, []);

    const calculateAverageSongPopularityScore = useCallback((playlistSongs) => {

        const songPopularityScores = playlistSongs.map(playlistSong => playlistSong.track.popularity);
        const avgSongPopularityScore = songPopularityScores.reduce((sum, sps) => sum + sps, 0) / songPopularityScores.length;
        
        return (avgSongPopularityScore).toFixed(2);
    }, []);


    const calculateMostTopSongsByTimeRange = useCallback((playlistSongs, topSongs) => {
       let topSongCount = 0;
       let topSongIds = topSongs.map(song => song.id);

        for (const key in playlistSongs) {
            if (topSongIds.includes(playlistSongs[key].track.id)) {
                topSongCount += 1;
            }
        }
        
        return ((topSongCount / playlistSongs.length) * 100).toFixed(1)
    }, []);

    // need to confirm accuracy
    const calculateArtistDiversityScore = useCallback((playlistSongs) => {
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
        
        return (richnessScore * (1 - evennessScore) * 100).toFixed(1)
    }, []);

    return { calculateSongTimeRangePercentage, calculateMostFrequentArtist, calculateAverageReleaseDate,
            calculateAverageDateAdded, calculateAverageSongDuration, calculateAverageSongPopularityScore,
            calculateMostTopSongsByTimeRange, calculateArtistDiversityScore };
}

export default useCalculatePlaylistStatsService;