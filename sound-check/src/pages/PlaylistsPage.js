/* PlaylistsPage */
import React, { useEffect, useState, useMemo } from 'react';
import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';
import PlaylistInsights from '../components/playlist/PlaylistInsights';
import { useLocation } from 'react-router-dom';
import './PlaylistsPage.css';

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistSongs, playlistStats, playlistScores, loading, error } = useSoundCheckContext();
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const location = useLocation();

    // Sorting state
    const [sortBy, setSortBy] = useState('rank'); // default sort by rank
    const [isAscending, setIsAscending] = useState(false);

    useEffect(() => {
        const selectedId = location?.state?.selectedPlaylistId;
        if (selectedId && Array.isArray(playlists) && playlists.length) {
            const pl = playlists.find(p => p.id === selectedId);
            if (pl) setSelectedPlaylist(pl);
        }
    }, [location?.state?.selectedPlaylistId, playlists]);

    // ---- Hooks & Memoized sorted playlists ----
    const sortedPlaylists = useMemo(() => {
        return [...playlists].sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'rank':
                    aVal = playlistScores[a.id]?.totalScore ?? -1;
                    bVal = playlistScores[b.id]?.totalScore ?? -1;
                    break;
                case 'cover':
                    aVal = a.images[0]?.url ?? '';
                    bVal = b.images[0]?.url ?? '';
                    break;
                case 'name':
                    aVal = a.name.toLowerCase();
                    bVal = b.name.toLowerCase();
                    break;
                case 'songs':
                    aVal = a.tracks.total;
                    bVal = b.tracks.total;
                    break;
                case 'totalScore':
                    aVal = playlistScores[a.id]?.totalScore ?? -1;
                    bVal = playlistScores[b.id]?.totalScore ?? -1;
                    break;
                case 'maintenanceScore':
                    aVal = Number(playlistScores[a.id]?.maintenanceScores.totalMaintenanceScore) ?? -1;
                    bVal = Number(playlistScores[b.id]?.maintenanceScores.totalMaintenanceScore) ?? -1;
                    break;
                case 'userRelevanceScore':
                    aVal = Number(playlistScores[a.id]?.userRelevanceScores.totalUserRelevanceScore) ?? -1;
                    bVal = Number(playlistScores[b.id]?.userRelevanceScores.totalUserRelevanceScore) ?? -1;
                    break;
                case 'generalRelevanceScore':
                    aVal = Number(playlistScores[a.id]?.generalRelevanceScores.totalGeneralRelevanceScore) ?? -1;
                    bVal = Number(playlistScores[b.id]?.generalRelevanceScores.totalGeneralRelevanceScore) ?? -1;
                    break;
                case 'artistDiversityScore':
                    aVal = Number(playlistScores[a.id]?.artistDiversityScores.totalArtistDiversityScore) ?? -1;
                    bVal = Number(playlistScores[b.id]?.artistDiversityScores.totalArtistDiversityScore) ?? -1;
                    break;
                case 'songLikenessScore':
                    aVal = Number(playlistScores[a.id]?.songLikenessScores.totalSongLikenessScore) ?? -1;
                    bVal = Number(playlistScores[b.id]?.songLikenessScores.totalSongLikenessScore) ?? -1;
                    break;
                default:
                    aVal = '';
                    bVal = '';
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return isAscending ? aVal - bVal : bVal - aVal;
            } else {
                return isAscending
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            }
        });
    }, [playlists, playlistScores, sortBy, isAscending]);

    // ---- Conditional returns after hooks ----
    if (loading) return <p>Spotify Playlist Data is loading...</p>;
    if (error) return <p>Error: {error}</p>;
    if (selectedPlaylist) {
        const playlistId = selectedPlaylist.id;
        return (
            <PlaylistInsights
                playlist={selectedPlaylist}
                playlistSongs={playlistSongs[playlistId]}
                playlistStats={playlistStats[playlistId]}
                playlistScores={playlistScores[playlistId]}
                onBack={() => setSelectedPlaylist(null)}
            />
        );
    }

    // ---- Sorting click handler ----
    const handleSort = (columnKey) => {
        if (sortBy === columnKey) {
            setIsAscending(!isAscending); // toggle direction
        } else {
            setSortBy(columnKey);
            setIsAscending(false); // default descending
        }
    };

    // ---- Arrow indicator for sorting ----
    const renderSortArrow = (columnKey) => {
        if (sortBy !== columnKey) return null;
        return isAscending ? ' ▲' : ' ▼';
    };

    // helper to render a table cell value
    // - bold when the column is the active sorted column
    // - add `small-number` class when the value is numeric and < 20 (but NOT for the 'rank' column)
    const renderCell = (columnKey, value) => {
        const isSorted = sortBy === columnKey;

        // robust numeric coercion
        const parsed = typeof value === 'number' ? value : Number(value);
        const numeric = (typeof parsed === 'number' && !isNaN(parsed)) ? parsed : null;
        const isSmallNumber = numeric !== null && numeric < 20 && columnKey !== 'rank';

        const classNames = [];
        if (isSorted) classNames.push('sorted-value');
        if (isSmallNumber) classNames.push('small-number');

        if (classNames.length > 0) {
            return <span className={classNames.join(' ')}>{value}</span>;
        }
        return <>{value}</>;
    };

    return (
        <div className="Playlists-Page">
            <PageHeader title="Playlists" />
            <div className="Page-Body">
                <div className="playlists-page-header">
                    <div>Owner: {playlists[0]["owner"]["display_name"]}</div>
                    <div>Number of Playlists: {playlists.length}</div>
                </div>
                <div className="playlist-items">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('rank')}>Rank{renderSortArrow('rank')}</th>
                                <th onClick={() => handleSort('cover')}>Cover{renderSortArrow('cover')}</th>
                                <th onClick={() => handleSort('name')}>Playlist Name{renderSortArrow('name')}</th>
                                <th onClick={() => handleSort('songs')}>Songs{renderSortArrow('songs')}</th>
                                <th onClick={() => handleSort('totalScore')}>Total Score{renderSortArrow('totalScore')}</th>
                                <th onClick={() => handleSort('maintenanceScore')}>Maintenance Score{renderSortArrow('maintenanceScore')}</th>
                                <th onClick={() => handleSort('userRelevanceScore')}>User Relevance Score{renderSortArrow('userRelevanceScore')}</th>
                                <th onClick={() => handleSort('generalRelevanceScore')}>General Relevance Score{renderSortArrow('generalRelevanceScore')}</th>
                                <th onClick={() => handleSort('artistDiversityScore')}>Artist Diversity Score{renderSortArrow('artistDiversityScore')}</th>
                                <th onClick={() => handleSort('songLikenessScore')}>Song Likeness Score{renderSortArrow('songLikenessScore')}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {sortedPlaylists.map((playlist, index) => (
                            <tr key={playlist.id}>
                                <td>{renderCell('rank', playlistScores[playlist.id]?.totalScore != null ? index + 1 : "–")}</td>
                                <td>
                                    <img 
                                        src={playlist.images[0]?.url} 
                                        alt={playlist.name} 
                                        style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                                    />
                                </td>
                                <td>
                                    <button onClick={() => setSelectedPlaylist(playlist)}>
                                        {playlist.name}
                                    </button>
                                </td>
                                <td>{renderCell('songs', playlist.tracks.total)}</td>
                                <td>{renderCell('totalScore', playlistScores[playlist.id]?.totalScore ?? "N/A")}</td>
                                <td>{renderCell('maintenanceScore', playlistScores[playlist.id]?.maintenanceScores.totalMaintenanceScore ?? "N/A")}</td>
                                <td>{renderCell('userRelevanceScore', playlistScores[playlist.id]?.userRelevanceScores.totalUserRelevanceScore ?? "N/A")}</td>
                                <td>{renderCell('generalRelevanceScore', playlistScores[playlist.id]?.generalRelevanceScores.totalGeneralRelevanceScore ?? "N/A")}</td>
                                <td>{renderCell('artistDiversityScore', playlistScores[playlist.id]?.artistDiversityScores.totalArtistDiversityScore ?? "N/A")}</td>
                                <td>{renderCell('songLikenessScore', playlistScores[playlist.id]?.songLikenessScores.totalSongLikenessScore ?? "N/A")}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlaylistsPage;