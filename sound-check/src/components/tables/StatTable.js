import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useTableUtils from '../../util/TableUtils';
import useRenderUtils from '../../util/RenderUtils';
import './StatTable.css';

/*
 * StatTable
 * Component for rendering a single table for a given stat category
 */
const StatTable = ({ categoryName, statColumns, playlists, playlistStats }) => {
    const [sortBy, setSortBy] = useState('name');
    const [isAscending, setIsAscending] = useState(true);
    const navigate = useNavigate();
    const { getComparableValuesForSort } = useTableUtils();
    const { renderFormattedStatValue, renderSortArrow } = useRenderUtils();

    /*
     * handleSort
     * Handles sorting when a column header is clicked
     */
    const handleSort = (columnTitle) => {
        if (sortBy === columnTitle) {
            setIsAscending((prev) => !prev);
        } else {
            setSortBy(columnTitle);
            setIsAscending(true);
        }
    };

    /*
     * handlePlaylistClick
     * Navigates from Dashboard page to Playlist page with selected playlist ID
     */
    const handlePlaylistClick = (e, playlistId) => {
        e.preventDefault();
        navigate('/playlists', { state: { selectedPlaylistId: playlistId } });
    };

    // memoized sorted playlists
    const sortedPlaylists = useMemo(() => {
        return [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else {
                const stat = statColumns.find(([key]) => key === sortBy);
                const type = stat?.[1]?.type ?? 'number';
                const statKey = stat?.[1]?.statKey;
                let aInputVal = playlistStats[a.id]?.[categoryName]?.[statKey];
                let bInputVal = playlistStats[b.id]?.[categoryName]?.[statKey];

                ({ aVal, bVal } = getComparableValuesForSort(type, aInputVal, bInputVal));
            }

            if (aVal < bVal) return isAscending ? -1 : 1;
            if (aVal > bVal) return isAscending ? 1 : -1;
            return 0;
        });
    }, [playlists, playlistStats, sortBy, isAscending, categoryName, statColumns, getComparableValuesForSort]);

    return (
        <div>
            <h2 className="categoryName">{categoryName}</h2>
            <table className="big-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')}>
                            Playlist Name {renderSortArrow('name', sortBy, isAscending)}
                        </th>
                        {statColumns.map(([key]) => (
                            <th key={key} onClick={() => handleSort(key)}>
                                {key} {renderSortArrow(key, sortBy, isAscending)}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sortedPlaylists.map((playlist) => (
                        <tr className="big-table-row" key={playlist.id}>
                            <td>
                                <a href="#" onClick={(e) => handlePlaylistClick(e, playlist.id)}>
                                    {playlist.name}
                                </a>
                            </td>
                            {statColumns.map(([key, value]) => {
                                const val = playlistStats[playlist.id]?.[categoryName]?.[value.statKey];
                                const type = value.type;
                                return (
                                    <td key={key}>
                                        {renderFormattedStatValue(val, type)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatTable;