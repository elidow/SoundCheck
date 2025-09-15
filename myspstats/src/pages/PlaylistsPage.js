/* PlaylistsPage */
import { React, useState } from 'react';
import { useMySPStatsContext } from '../context/MySPStatsContext';
import PlaylistInsights from '../components/playlist/PlaylistInsights'
import './PlaylistsPage.css'

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistSongs, playlistStats, playlistScores, loading, error } = useMySPStatsContext();
    const [ selectedPlaylist, setSelectedPlaylist ] = useState(null);

    if (loading) return <p>Spotify Playlist Data is loading...</p>
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
        )
    }

    // Pre-sort playlists by score
    const sortedPlaylists = playlists
        .slice()
        .sort((a, b) => {
            const scoreA = playlistScores[a.id]?.totalScore ?? -1; // use -1 so "N/A" goes last
            const scoreB = playlistScores[b.id]?.totalScore ?? -1;
            return scoreB - scoreA;
        });

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
                                <th> Rank </th>
                                <th> Cover </th>
                                <th> Playlist Name </th>
                                <th> Songs </th>
                                <th> Total Score </th>
                                <th> Maintenance Score </th>
                                <th> User Relevance Score </th>
                                <th> General Relevance Score </th>
                                <th> Artist Diversity Score </th>
                                <th> Song Likeness Score </th>
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
    )
}

export default PlaylistsPage;