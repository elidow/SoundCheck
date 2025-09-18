/* DashboardsPage */
import React from 'react';
import { useMySPStatsContext } from '../context/MySPStatsContext';
import Dashboard from '../components/dashboard/Dashboard';
import { statMap } from '../util/StatMaps'
import './DashboardsPage.css'

/*
 * DashboardsPage
 * Functional Component to render dashboards page
 */
const DashboardsPage = () =>  {
    const { playlists, playlistStats, playlistScores, loading, error } = useMySPStatsContext();

    const statObjects = Object.entries(statMap);

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboards-Page">
            <header className="Page-Header">
                <p>
                    Spotify Playlist Dashboards
                </p>
            </header>
            <div className="Page-Body">
                <div className="dashboards-page-header">
                    <div>Owner: {playlists[0]["owner"]["display_name"]}</div>
                    <div>Number of Playlists: {playlists.length}</div>
                </div>
                {statObjects.map(([key, value]) => (
                    <Dashboard key={key} name={key} playlists={playlists} playlistStats={playlistStats} playlistScores={playlistScores} statDetails={value} />
                ))}
            </div>
        </div>
    )
}

export default DashboardsPage;