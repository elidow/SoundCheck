import { useCallback } from 'react';

const useCalculatePlaylistStatsService = () => {

    const calculateSongTimeRangePercentage = useCallback((playlistSongs, startDate, endDate) => {
        let outdated = 0
        for (const key in playlistSongs) {
            if (startDate < playlistSongs[key].added_at && playlistSongs[key].added_at < endDate) {
                outdated += 1
            }
        }
        
        return ((outdated / playlistSongs.length) * 100).toFixed(1)
    }, []);

    return { calculateSongTimeRangePercentage };
}

export default useCalculatePlaylistStatsService;