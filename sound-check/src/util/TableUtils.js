import { useCallback } from 'react';

const useTableUtils = () => {
    const getComparableValuesForSort = useCallback((type, aInputVal, bInputVal) => {
        let aVal, bVal;
        
        if (type === "dateTime") {
            aVal = aInputVal ? Date.parse(aInputVal) : -Infinity;
            bVal = bInputVal ? Date.parse(bInputVal) : -Infinity;
        } else if (type.includes("artist")) {
            aVal = Number(aInputVal?.artistCount) ?? -Infinity;
            bVal = Number(bInputVal?.artistCount) ?? -Infinity;
        } else if (type === "time") {
            aVal = aInputVal 
                ? Number(aInputVal.split(":")[0]) * 60 + Number(aInputVal.split(":")[1])
                : -Infinity;
            bVal = bInputVal 
                ? Number(bInputVal.split(":")[0]) * 60 + Number(bInputVal.split(":")[1])
                : -Infinity;
        } else {
            aVal = Number(aInputVal) ?? -Infinity;
            bVal = Number(bInputVal) ?? -Infinity;
        }

        return { aVal, bVal };
    }, []);

    return { getComparableValuesForSort };
};

export default useTableUtils;