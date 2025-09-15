/* Dashboard */

import { useState } from 'react';
import { BarChart, Bar } from 'recharts';

/*
 * Dashboard
 * Component representation for a dashboard
 */
const Dashboard = ({ name, playlists, playlistStats, statDetails }) => {

    const [indexView, setIndexView] = useState(10);  // state for controlling number of displayed items in a dashboard
    const [expandButtonIcon, setExpandButtonIcon] = useState("➕"); // state for controlling expand icon
    const [isAscending, setIsAscending] = useState(false); // state for controlling order of list, Default: false = descending

    const { category, statKey, type } = statDetails;

    const data = [
        {
            stat: 2
        }
    ]

    /*
     * toggleExpandView
     * Toggles icon and index view count based on current
     */
    const toggleExpandView = () => {
        setExpandButtonIcon(prev => (prev === "➕" ? "➖" : "➕"))
        setIndexView(prev => (prev === 10 ? 100 : 10));
    };

    /*
     * toggleSortOrder
     * Toggles sort order based on current
     */
    const toggleSortOrder = () => {
        setIsAscending(prev => !prev);
    };

    /*
     * getSortedPlaylists
     * Sorts playlist based on stat, stat type, and sort order
     */
    const getSortedPlaylists = () => {
        const sorted = [...playlists].sort((a, b) => {
            let aVal, bVal;

            if (type === "dateTime") {
                aVal = playlistStats[a.id]?.[category]?.[statKey]
                    ? Date.parse(playlistStats[a.id][category][statKey])
                    : -Infinity;
                bVal = playlistStats[b.id]?.[category]?.[statKey]
                    ? Date.parse(playlistStats[b.id][category][statKey])
                    : -Infinity;
            } else if (type.includes("artist")) {
                aVal = playlistStats[a.id]?.[category]?.[statKey]?.artistCount ?? -Infinity;
                bVal = playlistStats[b.id]?.[category]?.[statKey]?.artistCount ?? -Infinity;
            } else {
                aVal = playlistStats[a.id]?.[category]?.[statKey] ?? -Infinity;
                bVal = playlistStats[b.id]?.[category]?.[statKey] ?? -Infinity;
            }

            return isAscending ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    };


    const sortedPlaylists = getSortedPlaylists();

    const fillGraphWithStat = (dp) => {
        if (dp < 60) {
            return "red"
        } else if (dp < 80) {
            return "yellow"
        }

        return "green";
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="dashboard-header-left-items">{name}</div>
                <button className="dashboard-header-right-items">⭐</button>
                <button className="dashboard-header-right-items" onClick={toggleSortOrder}>🔄</button>
                <button className="dashboard-header-right-items" onClick={toggleExpandView}>{expandButtonIcon}</button>
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
                                    {statDetails.type === "dateTime" ? (
                                        <div>{playlistStats[playlist.id][category]?.[statKey]?.substring(0,10)}</div>
                                    ) : statDetails.type.includes("artist") && statDetails.type.includes("number") ? (
                                        <div>
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistName}: 
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistCount}
                                        </div>
                                    ) : statDetails.type.includes("artist") && statDetails.type.includes("percentage") ? (
                                        <div>
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistName}: 
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistCount}%
                                        </div>
                                    ) : statDetails.type === "number" ? (
                                        <div>{playlistStats[playlist.id][category]?.[statKey]}</div>
                                    ) : (
                                        <div>{playlistStats[playlist.id][category]?.[statKey]}%</div>
                                    )}
                                </div>
                            ) : (
                                <p>No stats available</p>
                            )}
                            {playlistStats[playlist.id] ? (
                                <div className="dashboard-item-graph-data">
                                    <BarChart isHorizontal={true} width={200} height={20} data={data}>
                                        <Bar dataKey="stat" fill={fillGraphWithStat(81)} />
                                    </BarChart>
                                </div>
                            ) : (
                                <p>No stats available</p>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;