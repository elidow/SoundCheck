import { useState } from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import { statMap } from '../../util/Maps'
import './TablePage.css'

/*
 * TablePage
 * Functional Component to render table page
 */
const TablePage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();
    const [sortBy, setSortBy] = useState('name');
    const [isAscending, setIsAscending] = useState(false); // state for controlling order of list, Default: false = descending

    // Get all stat columns
    const statColumns = Object.entries(statMap);

    const getSortedPlaylists = () => {
        const statKey = sortBy;
        const type = statMap[statKey]["type"] ? statMap[statKey]["type"] : 'name';

        const sorted = [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (type === 'dateTime') {
                aVal = playlistStats[a.id]?.[statKey] ? Date.parse(playlistStats[a.id][statKey]) : -Infinity;
                bVal = playlistStats[b.id]?.[statKey] ? Date.parse(playlistStats[b.id][statKey]) : -Infinity;
            } else if (type.includes('artist')) {
                aVal = playlistStats[a.id]?.[statKey]?.["artistCount"] ?? -Infinity;
                bVal = playlistStats[b.id]?.[statKey]?.["artistCount"] ?? -Infinity;
            } else {
                aVal = playlistStats[a.id]?.[statKey] ?? -Infinity;
                bVal = playlistStats[b.id]?.[statKey] ?? -Infinity;
            }

            return isAscending ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    };

    //const sortedPlaylists = getSortedPlaylists();


    const handleSort = (columnTitle) => {
        setSortBy((prev) => {
            if (prev === columnTitle) {
                setIsAscending(prev => !prev);
                return prev;
            } else {
                setIsAscending(true);
                return columnTitle;
            }
        });
    };

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th onClick={() => handleSort('name')}>
                            Playlist Name {sortBy === 'name' ? (isAscending === true ? '↑' : '↓') : ''}
                        </th>
                        {statColumns.map(([title, key]) => (
                        <th key={title} onClick={() => handleSort(title)}>
                            {title} {sortBy === title ? (isAscending === true ? '↑' : '↓') : ''}
                        </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {playlists.map((playlist) => (
                    <tr key={playlist.id}>
                        <td>{playlist.name}</td>
                        {statColumns.map(([title, key]) => {
                            const val = playlistStats[playlist.id]?.[key["statKey"]];
                            const type = key["type"];
                            return (
                                <td key={title}>
                                    {type === "dateTime" && val ? (
                                        val.substring(0, 10)
                                    ) : type.includes("artist") && type.includes("number") ? (
                                        val["artistName"], val["artistCount"]
                                    ) : type.includes("artist") && type.includes("percentage") ? (
                                        val["artistCount"], val["artistName"]
                                    ) : (
                                        val
                                    )}
                                </td>
                            );
                        })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default TablePage;