/* DashboardsPage */
import React from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import Dashboard from '../../components/Dashboard/Dashboard';
import './DashboardsPage.css'

/*
 * DashboardsPage
 * Functional Component to render dashboard page
 */
const DashboardsPage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboard-Page">
            <header className="Page-Header">
                <p>
                    Spotify Dashboards
                </p>
            </header>
            <div className="Page-Body">
                <div className="dashboard-page-header">
                    <div>Owner: {playlists[0]["owner"]["display_name"]}</div>
                    <div>Number of Playlists: {playlists.length}</div>
                </div>
                <Dashboard name="Most Songs" type="number" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Most 2 Year Old Songs" type="percentage" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Most 6 Month New Songs" type="percentage" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Most Recent Song Added" type="date-time" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Most Frequent Artist By Count" type="artist" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Most Frequent Artist By Percentage" type="artist" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Newest Average Song Release Date" type="date-time" playlists={playlists} playlistStats={playlistStats} />
                <Dashboard name="Newest Average Song Added" type="date-time" playlists={playlists} playlistStats={playlistStats} />
            </div>
        </div>
    )
}

export default DashboardsPage;