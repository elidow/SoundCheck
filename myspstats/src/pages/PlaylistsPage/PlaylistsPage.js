/* PlaylistsPage */
import React from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import { statMap } from '../../util/Maps'
import './PlaylistsPage.css'

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Playlists-Page">
            <header className="Page-Header">
                <p>
                    Spotify Playlists
                </p>
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
                            </tr>
                        </thead>
                        <tbody>
                            {playlists.map((playlist, index) => (
                                <tr>
                                    <td>
                                        <img 
                                            src={playlist.images[0]?.url} 
                                            alt={playlist.name} 
                                            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                                        />
                                    </td>
                                    <td>{playlist.name}</td>
                                    <td>{playlist.tracks.total}</td>
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