/* Dashboard */

import React, { useState } from 'react';

const titleToKeyMap = {
    "Most 2 Year Old Songs": "twoYearPercentage",
    "Most 6 Month New Songs": "sixMonthPercentage",
    "Most Recent Song Added": "lastSongAdded"
};

/*
 * Dashboard
 * Component representation for a dashboard
 */
const Dashboard = ({ name, type, playlists, playlistStats }) => {

    const [indexView, setIndexView] = useState(10);  // state for controlling number of displayed items
    const [expandButtonIcon, setExpandButtonIcon] = useState("➕");
    const [isAscending, setIsAscending] = useState(false); // false = descending by default

    const expand = () => {
        setExpandButtonIcon(prev => (prev === "➕" ? "➖" : "➕"))
        setIndexView(prev => (prev === 10 ? 100 : 10));
    };

    const toggleSortOrder = () => {
        setIsAscending(prev => !prev);
    };

    const getSortedPlaylists = () => {
        const statKey = titleToKeyMap[name];

        const sorted = [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (type === 'date-time') {
                aVal = playlistStats[a.id]?.[statKey] ? Date.parse(playlistStats[a.id][statKey]) : -Infinity;
                bVal = playlistStats[b.id]?.[statKey] ? Date.parse(playlistStats[b.id][statKey]) : -Infinity;
            } else {
                aVal = playlistStats[a.id]?.[statKey] ?? -Infinity;
                bVal = playlistStats[b.id]?.[statKey] ?? -Infinity;
            }

            return isAscending ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    };

    const sortedPlaylists = getSortedPlaylists();

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="dashboard-header-left-items">{name}</div>
                <button className="dashboard-header-right-items">⭐</button>
                <button className="dashboard-header-right-items" onClick={toggleSortOrder}>🔄</button>
                <button className="dashboard-header-right-items" onClick={expand}>{expandButtonIcon}</button>
                <button className="dashboard-header-right-items">✏️</button>
            </div>
            <div className="dashboard-items">
                {sortedPlaylists.length === 0 ? (
                    <p>No playlists found.</p>
                ) : (
                    sortedPlaylists.slice(0, indexView).map((playlist, index) => (
                        <div className="dashboard-item" key={playlist.id}>
                            <div className="dashboard-item-index"> {index + 1} </div>
                            <div className="dashboard-item-playlist-name">
                                <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                                    {playlist.name}
                                 </a>
                            </div>
                            {playlistStats[playlist.id] ? (
                                <div className="dashboard-item-stat-data">
                                    {name === "Most Recent Song Added" ? (
                                        <div>{playlistStats[playlist.id][titleToKeyMap[name]]?.substring(0,10)}</div>
                                    ) : (
                                         <div>{playlistStats[playlist.id][titleToKeyMap[name]]}%</div>
                                    )}
                                </div>
                            ) : (
                                <p>No stats available</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
};

export default Dashboard;