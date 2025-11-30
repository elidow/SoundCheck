import { useCallback } from 'react';

/*
 * useCalculatePlaylistRanksService
 * Custom hook to handle all rank calculations
 */
const useCalculatePlaylistRanksService = () => {

    /*
     * calculateRank
     * Given a list of stats length n and an index, calculates the rank (1-n)
     */
    const calculateRank = useCallback((list, index) => {
        const sortedList = [...list].sort((a, b) => b - a);
        const value = list[index];
        return sortedList.indexOf(value) + 1;
    }, []);

    return { calculateRank };
}

export default useCalculatePlaylistRanksService;