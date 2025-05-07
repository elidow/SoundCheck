/* Dashboard */

import React from 'react';
import DashboardPlaylistData from './DashboardPlaylistData';
import DashboardStatData from './DashboardStatData';

const titleToKeyMap = {
    "Most 2 Year Old Songs": "twoYearPercentage",
    "Most 6 Month New Songs": "sixMonthPercentage"
};

/*
 * Dashboard
 * Component representation for a dashboard
 */
const Dashboard = ({ name, playlists, playlistStats }) => {
    //const [ showExpanded, setShowExpanded ] = useState(false);

    const getSortedPlaylists = () => {
        const statKey = titleToKeyMap[name];

        return [...playlists].sort((a, b) => {
            const aVal = playlistStats[a.id]?.[statKey] ?? -Infinity;
            const bVal = playlistStats[b.id]?.[statKey] ?? -Infinity;
            return bVal - aVal; // descending
        });
    };

    const sortedPlaylists = getSortedPlaylists();

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="dashboard-header-left-items">{name}</div>
                <div className="dashboard-header-right-items">⭐</div>
                <button className="dashboard-header-right-items">➕</button>
                <button className="dashboard-header-right-items">✏️</button>
            </div>
            <div className="dashboard-items">
                {sortedPlaylists.length === 0 ? (
                    <p>No playlists found.</p>
                ) : (
                    sortedPlaylists.map((playlist, index) => {
                        if (index < 10) {
                            return <div className="dashboard-item" key={playlist.id}>
                                {index + 1}
                                <DashboardPlaylistData playlist={playlist} />
                                {playlistStats[playlist.id] ? (
                                    <DashboardStatData
                                        stats={playlistStats[playlist.id]}
                                        statKey={titleToKeyMap[name]}
                                    />
                                ) : (
                                    <p>No stats available</p>
                                )}
                            </div>
                        } else {
                            return null
                        }
                    })
                )}
            </div>
        </div>
    )
};

export default Dashboard;