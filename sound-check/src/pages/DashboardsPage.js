/* DashboardsPage */
import React from 'react';
import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';
import Dashboard from '../components/dashboard/Dashboard';
import { statMap } from '../util/StatMaps'
import './DashboardsPage.css'

/*
 * DashboardsPage
 * Functional Component to render dashboards page
 */
const DashboardsPage = () => {
    const [expandedDashboard, setExpandedDashboard] = React.useState(null);
    const statObjects = Object.entries(statMap);
    const { playlists, playlistStats, playlistScores, loading, error } = useSoundCheckContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboards-Page">
            <PageHeader title="Dashboards" />
            <div className="Page-Body">
                <div className="dashboards-page-header">
                    <div>Owner: {playlists[0]["owner"]["display_name"]}</div>
                    <div>Number of Playlists: {playlists.length}</div>
                </div>
                <div className="dashboards">
                    {statObjects.map(([key, value]) => (
                        <Dashboard
                            key={key}
                            name={key}
                            playlists={playlists}
                            playlistStats={playlistStats}
                            playlistScores={playlistScores}
                            statDetails={value}
                            expandedDashboard={expandedDashboard}
                            setExpandedDashboard={setExpandedDashboard}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardsPage;