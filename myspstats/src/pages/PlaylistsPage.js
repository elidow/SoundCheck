/* PlaylistsPage */
import { React, useState } from 'react';
import { useMySPStatsContext } from '../context/MySPStatsContext';
import PlaylistSongs from '../components/playlistSongs/PlaylistSongs'
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
            <PlaylistSongs 
                playlist={selectedPlaylist} 
                playlistSongs={playlistSongs[playlistId]} 
                playlistStats={playlistStats[playlistId]}
                playlistScores={playlistScores[playlistId]} 
                onBack={() => setSelectedPlaylist(null)} 
            />
        )
    }

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
                                <th> Cover </th>
                                <th> Playlist Name </th>
                                <th> Songs </th>
                                <th> Maintenance Score </th>
                                <th> User Relevance Score </th>
                                <th> General Relevance Score </th>
                                <th> Artist Diversity Score </th>
                                <th> Song Likeness Score </th>
                                <th> Total Score </th>
                            </tr>
                        </thead>
                        <tbody>
                        {playlists
                            .slice() // shallow copy
                            .sort((a, b) => {
                                const scoreA = playlistScores[a.id]?.totalScore ?? 0;
                                const scoreB = playlistScores[b.id]?.totalScore ?? 0;
                                return scoreB - scoreA; // descending (highest first)
                            })
                            .map((playlist) => (
                                <tr key={playlist.id}>
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
                                    <td>{playlistScores[playlist.id]?.maintenanceScores.totalMaintenanceScore ?? "N/A"}</td>
                                    <td>{playlistScores[playlist.id]?.userRelevanceScores.totalUserRelevanceScore ?? "N/A"}</td>
                                    <td>{playlistScores[playlist.id]?.generalRelevanceScores.totalGeneralRelevanceScore ?? "N/A"}</td>
                                    <td>{playlistScores[playlist.id]?.artistDiversityScores.totalArtistDiversityScore ?? "N/A"}</td>
                                    <td>{playlistScores[playlist.id]?.songLikenessScores.totalSongLikenessScore ?? "N/A"}</td>
                                    <td>{playlistScores[playlist.id]?.totalScore ?? "N/A"}</td>
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