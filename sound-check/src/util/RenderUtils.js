import { useCallback } from 'react';

const useRenderUtils = () => {
    /*
     * renderFormattedStatValue
     * Renders a stat value based on its type
     */
    const renderFormattedStatValue = useCallback((val, statType) => {
        if (statType === 'dateTime') return val ? val.substring(0, 10) : '-';
        if (statType.includes('artist') && statType.includes('number')) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}`;
        }
        if (statType.includes('artist') && statType.includes('percentage')) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}%`;
        }
        if (statType === 'number' || statType === 'time') return val ?? '-';
        return `${val ?? '-'}%`;
    }, []);

    /*
     * renderSortArrow
     * Pure helper that returns the appropriate sort arrow for a column
     */
    const renderSortArrow = useCallback((column, sortBy, isAscending) => {
        if (sortBy !== column) return '';
        return isAscending ? '▲' : '▼';
    }, []);

    return { renderFormattedStatValue, renderSortArrow };
};

export default useRenderUtils;
