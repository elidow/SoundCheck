/* Dashboard */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import useTableUtils from '../../util/TableUtils';

/*
 * Dashboard
 * Component for rendering a single dashboard for a stat/score
 */
const Dashboard = ({ name, playlists, playlistStats, playlistScores, statDetails, expandedDashboard, setExpandedDashboard }) => {
    const [isAscending, setIsAscending] = useState(false);
    const navigate = useNavigate();
    const { category, statKey, type } = statDetails;
    const { getComparableValuesForSort } = useTableUtils();

    /*
     * toggleExpandView
     * Toggles icon and index view count based on current
     */
    const toggleExpandView = () => {
        // if this dashboard is already expanded, collapse it; otherwise expand this one
        if (expandedDashboard === name) {
            setExpandedDashboard(null);
        } else {
            setExpandedDashboard(name);
        }
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
    const sortedPlaylists = useMemo(() => {
        return [...playlists].sort((a, b) => {
            let aInputVal = playlistStats[a.id]?.[category]?.[statKey];
            let bInputVal = playlistStats[b.id]?.[category]?.[statKey];

            let { aVal, bVal } = getComparableValuesForSort(type, aInputVal, bInputVal);

            return isAscending ? aVal - bVal : bVal - aVal;
        });
    }, [playlists, playlistStats, isAscending, category, statKey, type, getComparableValuesForSort]);
    const indexView = expandedDashboard === name ? 100 : 10;
    const expandButtonIcon = expandedDashboard === name ? "➖" : "➕";

    const categoryToScoreKey = {
        artistStats: "artistDiversity",
        songStats: "songLikeness",
        advancedSongStats: "songLikeness"
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const score = payload[0].value;
            return (
                <div style={{
                    background: 'rgba(0,0,0,0.85)',
                    color: '#fff',
                    padding: '6px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    pointerEvents: 'none'
                }}>
                    {`Score: ${score}`}
                </div>
            );
        }
        return null;
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
                width={120}
                height={14}
                data={barData}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                <Tooltip content={<CustomTooltip />} />
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

    const handlePlaylistClick = (e, playlistId) => {
        e.preventDefault();
        navigate('/playlists', { state: { selectedPlaylistId: playlistId } });
    };

    return (
        <div
            className={"dashboard" + (expandedDashboard === name ? ' expanded' : '')}
            style={{
                gridColumn: expandedDashboard === name ? "span 1" : "auto",
            }}
        >
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
                                <a href="#" onClick={(e) => handlePlaylistClick(e, playlist.id)}>
                                    {playlist.name}
                                </a>
                            </div>
                            {playlistStats[playlist.id] ? (
                                <div className="dashboard-item-stat-data">
                                    {statDetails.type === "dateTime" ? (
                                        <div>{playlistStats[playlist.id][category]?.[statKey]?.substring(0,10)}</div>
                                    ) : statDetails.type.includes("artist") && statDetails.type.includes("number") ? (
                                        <div>
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistName}: {playlistStats[playlist.id][category]?.[statKey]?.artistCount}
                                        </div>
                                    ) : statDetails.type.includes("artist") && statDetails.type.includes("percentage") ? (
                                        <div>
                                            {playlistStats[playlist.id][category]?.[statKey]?.artistName}: {playlistStats[playlist.id][category]?.[statKey]?.artistCount}%
                                        </div>
                                    ) : statDetails.type === "number" || statDetails.type === "time" ? (
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