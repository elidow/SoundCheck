import { useCallback } from "react";

const useFormatUtils = () => {

    /*
    * renderStatValue
    * Renders a stat value based on its type
    */
    const renderStatValue = useCallback((val, statType) => {
        if (statType === 'dateTime') {
            return val ? val.substring(0, 10) : '-';
        }
        if (statType.includes('artist') && statType.includes('number')) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}`;
        }
        if (statType.includes('artist') && statType.includes('percentage')) {
            return `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}%`;
        }
        if (statType === 'number' || statType === 'time') {
            return val ?? '-';
        }
        return `${val ?? '-'}%`;
    }, []);

    return { renderStatValue };
};

export default useFormatUtils;