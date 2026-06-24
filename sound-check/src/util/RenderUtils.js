import { useCallback } from 'react';

const number = "number";
const percentage = "percentage";
const dateTime = "dateTime";
const artist = "artist";
const time = "time";
const squaredMinutes = "squaredMinutes"
const squaredDays = "squaredDays"

const useRenderUtils = () => {
    const formatDateTimeString = (val) => {
        const date = new Date(val);
        if (Number.isNaN(date.getTime())) return '-';

        const monthNames = [
            'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.',
            'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
        ];

        const day = date.getDate();
        const suffix = (d) => {
            const remainder = d % 10;
            const remainderHundred = d % 100;
            if (remainderHundred >= 11 && remainderHundred <= 13) return 'th';
            if (remainder === 1) return 'st';
            if (remainder === 2) return 'nd';
            if (remainder === 3) return 'rd';
            return 'th';
        };

        return `${monthNames[date.getMonth()]} ${day}${suffix(day)}, ${date.getFullYear()}`;
    };

    /*
     * renderFormattedStatValue
     * Renders a stat value based on its type
     */
    const renderFormattedStatValue = useCallback((val, statType) => {
        if (statType === dateTime) return val ? formatDateTimeString(val) : '-';
        if (statType.includes(artist) && statType.includes(number)) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}`;
        }
        if (statType.includes(artist) && statType.includes(percentage)) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}%`;
        }
        if (statType.includes(number) && statType.includes(squaredMinutes)) {
            return `${val ?? '-'} minutes\u00b2`
        }
        if (statType.includes(number) && statType.includes(squaredDays)) {
            return `${val ?? '-'} days\u00b2`
        }
        if (statType === number || statType === time) return val ?? '-';
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

    return { formatDateTimeString, renderFormattedStatValue, renderSortArrow };
};

export default useRenderUtils;
