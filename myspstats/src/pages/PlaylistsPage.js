/* PlaylistsPage */
import React, { useState, useMemo } from 'react';
import { useMySPStatsContext } from '../context/MySPStatsContext';
import PlaylistInsights from '../components/playlist/PlaylistInsights';
import './PlaylistsPage.css';

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistSongs, playlistStats, playlistScores, loading, error } = useMySPStatsContext();
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    // Sorting state
    const [sortBy, setSortBy] = useState('rank'); // default sort by rank
    const [isAscending, setIsAscending] = useState(false);

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
            setIsAscending(true); // default ascending
        }
    };

    // ---- Arrow indicator for sorting ----
    const renderSortArrow = (columnKey) => {
        if (sortBy !== columnKey) return null;
        return isAscending ? ' ▲' : ' ▼';
    };

    return (
        <div className="Playlists-Page">
            <header className="Page-Header">
                <p>Spotify Playlists</p>
            </header>
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
                                <td>{playlistScores[playlist.id]?.totalScore != null ? index + 1 : "–"}</td>
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
                                <td>{playlist.tracks.total}</td>
                                <td><b>{playlistScores[playlist.id]?.totalScore ?? "N/A"}</b></td>
                                <td>{playlistScores[playlist.id]?.maintenanceScores.totalMaintenanceScore ?? "N/A"}</td>
                                <td>{playlistScores[playlist.id]?.userRelevanceScores.totalUserRelevanceScore ?? "N/A"}</td>
                                <td>{playlistScores[playlist.id]?.generalRelevanceScores.totalGeneralRelevanceScore ?? "N/A"}</td>
                                <td>{playlistScores[playlist.id]?.artistDiversityScores.totalArtistDiversityScore ?? "N/A"}</td>
                                <td>{playlistScores[playlist.id]?.songLikenessScores.totalSongLikenessScore ?? "N/A"}</td>
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