/* Dashboard */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import useTableUtils from '../../util/TableUtils';
import useRenderUtils from '../../util/RenderUtils';
import './Dashboard.css';

/*
 * Dashboard
 * Component for rendering a single dashboard for a stat/score
 */
const Dashboard = ({ name, playlists, playlistStats, playlistScores, statDetails, expandedDashboard, setExpandedDashboard }) => {
    const [isAscending, setIsAscending] = useState(false);
    const navigate = useNavigate();
    const { getComparableValuesForSort } = useTableUtils();
    const { renderFormattedStatValue, renderSortArrow } = useRenderUtils();

    const { category, statKey, type } = statDetails;

    const indexView = expandedDashboard === name ? 100 : 10;
    const expandButtonIcon = expandedDashboard === name ? "➖" : "➕";

    const CATEGORY_TO_SCORE_KEY = {
        artistStats: "artistDiversity",
        songStats: "songLikeness",
        advancedSongStats: "songLikeness"
    };

    /*
     * mapScoreToColor
     * Maps a score (0-100) to a color from red (0) to green (100)
     */
    const mapScoreToColor = (score) => {
        let r, g, b = 0;
        const value = Math.max(0, Math.min(100, score));

        if (value < 50) { // 0 → 50: red to yellow
            r = 255;
            g = Math.round(5.1 * value); // 0 → 255
            b = 0;
        } else { // 50 → 100: yellow to green
            g = 255;
            r = Math.round(510 - 5.1 * value); // 255 → 0
            b = 0;
        }

        return `rgb(${r},${g},${b})`;
    };

    /*
     * toggleExpandView
     * Toggles expand/collapse view of dashboard
     */
    const toggleExpandView = () => {
        setExpandedDashboard(expandedDashboard === name ? null : name);
    };

    /*
     * toggleSortOrder
     * Toggles sort order based on current
     */
    const toggleSortOrder = () => {
        setIsAscending(prev => !prev);
    };

    /*
     * handlePlaylistClick
     * Navigates from Dashboard page to Playlist page with selected playlist ID
     */
    const handlePlaylistClick = (e, playlistId) => {
        e.preventDefault();
        navigate('/playlists', { state: { selectedPlaylistId: playlistId } });
    };

    // memoized sorted playlists
    const sortedPlaylists = useMemo(() => {
        return [...playlists].sort((a, b) => {
            let aInputVal = playlistStats[a.id]?.[category]?.[statKey];
            let bInputVal = playlistStats[b.id]?.[category]?.[statKey];

            let { aVal, bVal } = getComparableValuesForSort(type, aInputVal, bInputVal);

            return isAscending ? aVal - bVal : bVal - aVal;
        });
    }, [playlists, playlistStats, isAscending, category, statKey, type, getComparableValuesForSort]);

    /*
     * ScoreTooltip
     * Custom tooltip for score bar chart
     */
    const ScoreTooltip = ({ active, payload }) => {
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

    /*
     * renderScoreBar
     * Renders a horizontal bar chart for the playlist score
     */
    const renderScoreBar = (playlist, statKey, category) => {
        const scoreCategory = CATEGORY_TO_SCORE_KEY[category] || category;
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
                <Tooltip content={<ScoreTooltip/>} />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" hide />
                <Bar
                    dataKey="score"
                    fill={mapScoreToColor(score)}
                />
            </BarChart>
        );
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
                    <button className="dashboard-header-right-items" onClick={toggleSortOrder}>🔄</button>
                    <button className="dashboard-header-right-items" onClick={toggleExpandView}>{expandButtonIcon}</button>
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
                                    <div>{renderFormattedStatValue(playlistStats[playlist.id][category]?.[statKey], type)}</div>
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