import { useState } from 'react';
import { useMySPStatsContext } from '../../context/MySPStatsContext';
import { statMap } from '../../util/Maps'
import './TablePage.css'

/*
 * TablePage
 * Functional Component to render table page
 */
const TablePage = () =>  {
    const { playlists, playlistStats, loading, error } = useMySPStatsContext();
    const [sortBy, setSortBy] = useState('name');
    const [isAscending, setIsAscending] = useState(true); // state for controlling order of list, Default: false = descending

    // Get all stat columns
    const statColumns = Object.entries(statMap);

    const getSortedPlaylists = () => {
        const sorted = [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (sortBy === 'name') {
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
            } else {
                const statKey = statMap[sortBy]?.statKey;
                const type = statMap[sortBy]?.type ?? 'number';

                if (type === 'dateTime') {
                    aVal = Date.parse(playlistStats[a.id]?.[statKey]) || -Infinity;
                    bVal = Date.parse(playlistStats[b.id]?.[statKey]) || -Infinity;
                } else if (type.includes('artist')) {
                    aVal = Number(playlistStats[a.id]?.[statKey]?.["artistCount"]) ?? -Infinity;
                    bVal = Number(playlistStats[b.id]?.[statKey]?.["artistCount"]) ?? -Infinity;
                } else {
                    aVal = Number(playlistStats[a.id]?.[statKey]) ?? -Infinity;
                    bVal = Number(playlistStats[b.id]?.[statKey]) ?? -Infinity;
                }
            }

            if (aVal < bVal) return isAscending ? -1 : 1;
            if (aVal > bVal) return isAscending ? 1 : -1;
            return 0;
        });

        return sorted;
    };


    const handleSort = (columnTitle) => {
        if (sortBy === columnTitle) {
            setIsAscending(prev => !prev); // toggle sort direction
        } else {
            setSortBy(columnTitle);        // new column
            setIsAscending(false);          // default: ascending on new column
        }
    };

    const sortedPlaylists = getSortedPlaylists();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Table-Page">
            <header className="Page-Header">
                <p>
                    Spotify Playlist Table
                </p>
            </header>
            <div>
                <table className="big-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('name')}>
                                Playlist Name {sortBy === 'name' ? (isAscending === true ? '↑' : '↓') : ''}
                            </th>
                            {statColumns.map(([key, value]) => (
                            <th key={key} onClick={() => handleSort(key)}>
                                {key} {sortBy === key ? (isAscending === true ? '↑' : '↓') : ''}
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
                                const val = playlistStats[playlist.id]?.[value["statKey"]];
                                const type = value["type"];
                                return (
                                    <td key={key}>
                                        {type === "dateTime" && val ? (
                                            val.substring(0, 10)
                                        ) : type.includes("artist") && type.includes("number") ? (
                                            `${val?.artistName ?? '-'}, ${val?.artistCount ?? '-'}`
                                        ) : type.includes("artist") && type.includes("percentage") ? (
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
        </div>
    )
}

export default TablePage;