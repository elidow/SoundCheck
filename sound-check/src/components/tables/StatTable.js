import { useState } from 'react';
import './StatTable.css';

/*
 * StatTable
 * Renders a single table for a given stat category
 */
const StatTable = ({ categoryName, statColumns, playlists, playlistStats }) => {
    const [sortBy, setSortBy] = useState('name');
    const [isAscending, setIsAscending] = useState(true);

    const getSortedPlaylists = () => {
        return [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else {
                const stat = statColumns.find(([key]) => key === sortBy);
                const statKey = stat?.[1]?.statKey;
                const type = stat?.[1]?.type ?? 'number';

                if (type === 'dateTime') {
                    aVal = Date.parse(playlistStats[a.id]?.[categoryName]?.[statKey]) || -Infinity;
                    bVal = Date.parse(playlistStats[b.id]?.[categoryName]?.[statKey]) || -Infinity;
                } else if (type.includes('artist')) {
                    aVal = Number(playlistStats[a.id]?.[categoryName]?.[statKey]?.artistCount) ?? -Infinity;
                    bVal = Number(playlistStats[b.id]?.[categoryName]?.[statKey]?.artistCount) ?? -Infinity;
                } else {
                    aVal = Number(playlistStats[a.id]?.[categoryName]?.[statKey]) ?? -Infinity;
                    bVal = Number(playlistStats[b.id]?.[categoryName]?.[statKey]) ?? -Infinity;
                }
            }

            if (aVal < bVal) return isAscending ? -1 : 1;
            if (aVal > bVal) return isAscending ? 1 : -1;
            return 0;
        });
    };

    const handleSort = (columnTitle) => {
        if (sortBy === columnTitle) {
            setIsAscending((prev) => !prev);
        } else {
            setSortBy(columnTitle);
            setIsAscending(true);
        }
    };

    const sortedPlaylists = getSortedPlaylists();

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
                                <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
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
                                            `${val?.artistName ?? '-'}, ${val?.artistCount ?? '-'}`
                                        ) : type.includes('artist') && type.includes('percentage') ? (
                                            `${val?.artistName ?? '-'}, ${val?.artistCount ?? '-'}%`
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