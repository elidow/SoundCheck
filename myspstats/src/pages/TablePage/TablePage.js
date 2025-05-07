import React from "react";
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import './TablePage.css'

/*
 * TablePage
 * Functional Component to render table page
 */
const TablePage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Table-Page">
            <header className="Page-Header">
                <p>
                    Spotify Table
                </p>
            </header>
            <div className="table">
                {playlists.length === 0 ? (
                    <p>No playlists found.</p>
                ) : (
                    playlists.map((playlist) => (
                        <div className="table-item">
                            <p>{playlist.name}</p>
                            {playlistStats[playlist.id] ? (
                                <p>{playlistStats[playlist.id].twoYearPercentage}</p>
                            ) : (
                                <p>No stats available</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default TablePage;