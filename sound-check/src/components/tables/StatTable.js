import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useTableUtils from '../../util/TableUtils';
import './StatTable.css';

/*
 * StatTable
 * Component for rendering a single table for a given stat category
 */
const StatTable = ({ categoryName, statColumns, playlists, playlistStats }) => {
    const { getComparableValuesForSort } = useTableUtils();
    const [sortBy, setSortBy] = useState('name');
    const [isAscending, setIsAscending] = useState(true);
    const navigate = useNavigate();

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

    const handleSort = (columnTitle) => {
        if (sortBy === columnTitle) {
            setIsAscending((prev) => !prev);
        } else {
            setSortBy(columnTitle);
            setIsAscending(true);
        }
    };

    const handlePlaylistClick = (e, playlistId) => {
        e.preventDefault();
        navigate('/playlists', { state: { selectedPlaylistId: playlistId } });
    };

    return (
        <div>
            <h2 className="categoryName">{categoryName}</h2>
            <table className="big-table">
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')}>
                            Playlist Name {sortBy === 'name' ? (isAscending ? '↑' : '↓') : ''}
                        </th>
                        {statColumns.map(([key]) => (
                            <th key={key} onClick={() => handleSort(key)}>
                                {key} {sortBy === key ? (isAscending ? '↑' : '↓') : ''}
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
                                        {type === 'dateTime' && val ? (
                                            val.substring(0, 10)
                                        ) : type.includes('artist') && type.includes('number') ? (
                                            `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}`
                                        ) : type.includes('artist') && type.includes('percentage') ? (
                                            `${val?.artistName ?? '-'}: ${val?.artistCount ?? '-'}%`
                                        ) : (
                                            val ?? '-'
                                        )}
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