/* Dashboard */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

/*
 * Dashboard
 * Component representation for a dashboard
 */
const Dashboard = ({ name, playlists, playlistStats, playlistScores, statDetails }) => {

    const [indexView, setIndexView] = useState(10);  // state for controlling number of displayed items in a dashboard
    const [expandButtonIcon, setExpandButtonIcon] = useState("➕"); // state for controlling expand icon
    const [isAscending, setIsAscending] = useState(false); // state for controlling order of list, Default: false = descending

    const { category, statKey, type } = statDetails;

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

    const categoryToScoreKey = {
        artistStats: "artistDiversity",
        songStats: "songLikeness",
    };

    const renderScoreBar = (playlist, statKey, category) => {
        const scoreCategory = categoryToScoreKey[category] || category;
        const scoreKey = `${statKey}Score`;
        const score = playlistScores[playlist.id]?.[`${scoreCategory}Scores`]?.[scoreKey] ?? null;

        if (score == null) {
            return <div>No score available</div>;
        }

        const barData = [{ name: statKey, score }];

        return (
            <BarChart
                layout="vertical"
                width={200}
                height={20}
                data={barData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" hide />
                <Bar
                    dataKey="score"
                    fill={mapScoreToColor(score)}
                />
            </BarChart>
        );
    }

    const mapScoreToColor = (score) => {
        // Clamp score between 0 and 100
        const value = Math.max(0, Math.min(100, score));

        let r, g, b = 0;

        if (value < 50) {
            // 0 → 50: red to yellow
            r = 255;
            g = Math.round(5.1 * value); // 0 → 255
            b = 0;
        } else {
            // 50 → 100: yellow to green
            g = 255;
            r = Math.round(510 - 5.1 * value); // 255 → 0
            b = 0;
        }

        return `rgb(${r},${g},${b})`;
    }

    return (
        <div className="dashboard">
            <div className="dashboard-header">
                <div className="dashboard-header-left-items">{name}</div>
                <div className="dashboard-header-right-group">
                    <button className="dashboard-header-right-items">⭐</button>
                    <button className="dashboard-header-right-items" onClick={toggleSortOrder}>🔄</button>
                    <button className="dashboard-header-right-items" onClick={toggleExpandView}>{expandButtonIcon}</button>
                    <button className="dashboard-header-right-items">✏️</button>
                </div>
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
                                    {renderScoreBar(playlist, statKey, category)}
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