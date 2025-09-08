/* PlaylistsPage */
import { React, useState } from 'react';
import { useMySPStatsContext } from '../../context/MySPStatsContext';
import PlaylistSongs from '../../components/PlaylistSongs/PlaylistSongs'
import './PlaylistsPage.css'

/*
 * PlaylistsPage
 * Functional Component to render playlists page
 */
const PlaylistsPage = () =>  {
    const { playlists, playlistSongs, playlistStats, playlistMetaStats, loading, error } = useMySPStatsContext();
    const [ selectedPlaylist, setSelectedPlaylist ] = useState(null);

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;
    if (selectedPlaylist) {
        const playlistId = selectedPlaylist.id;
        return <PlaylistSongs playlist={selectedPlaylist} playlistSongs={playlistSongs[playlistId]} playlistStats={playlistStats[playlistId]}
        playlistMetaStats={playlistId} onBack={() => setSelectedPlaylist(null)} />
    }

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
                                    <button onClick={() => setSelectedPlaylist(playlist)}>
                                        {playlist.name}
                                    </button>
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