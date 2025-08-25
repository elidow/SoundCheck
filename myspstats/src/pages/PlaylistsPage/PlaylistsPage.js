/* PlaylistsPage */
import React from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
//import { statMap } from '../../util/Maps'
import './PlaylistsPage.css'

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistMetaStats, loading, error } = useSpotifyPlaylistContext();

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
                        {playlists
                            .slice() // make a shallow copy so you don’t mutate context state
                            .sort((a, b) => {
                            const scoreA = playlistMetaStats[a.id]?.playlistScore ?? 0;
                            const scoreB = playlistMetaStats[b.id]?.playlistScore ?? 0;
                            return scoreB - scoreA; // descending order (highest first)
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
                                <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                    {playlist.name}
                                </a>
                                </td>
                                <td>{playlist.tracks.total}</td>
                                <td>{playlistMetaStats[playlist.id]?.playlistScore ?? "N/A"}</td>
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