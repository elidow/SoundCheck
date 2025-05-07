import { useCallback } from 'react';

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

    return { calculateSongTimeRangePercentage, calculateMostFrequentArtist, calculateAverageReleaseDate, calculateAverageDateAdded };
}

export default useCalculatePlaylistStatsService;