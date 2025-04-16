import React, { useEffect, useState } from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import PlaylistItem from '../../components/PlaylistItem';
import SpotifyStat from '../../components/SpotifyStat';
import './DashboardsPage.css'

const DashboardsPage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboard-Page">
            <header className="App-header">
                <p>
                    Spotify Dashboards
                </p>
            </header>
            <div className="dashboard">
                {playlists.length === 0 ? (
                    <p>No playlists found.</p>
                ) : (
                    playlists.map((playlist) => (
                        <div className="dashboard-item">
                            <PlaylistItem key={playlist.id} playlist={playlist} />
                            {playlistStats[playlist.id] ? (
                                <SpotifyStat stats={playlistStats[playlist.id]} />
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

export default DashboardsPage;