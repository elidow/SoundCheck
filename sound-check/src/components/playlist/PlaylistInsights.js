/* PlaylistInsights */
import { useEffect, useState, useMemo } from 'react';
import { useSoundCheckContext } from '../../context/SoundCheckContext';
import PageHeader from '../../components/common/PageHeader';
import useRenderUtils from '../../util/RenderUtils';
import { statMap } from '../../util/StatMaps'
import './PlaylistInsights.css';

/*
 * PlaylistInsights
 * Component for rendering playlist insights including stats, scores, and song data
 */
const PlaylistInsights = ({ playlist, playlistSongs, playlistStats, playlistScores, onBack }) => {
    const [sortBy, setSortBy] = useState('trackNumber');
    const [isAscending, setIsAscending] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const { refreshPlaylistData } = useSoundCheckContext();

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshPlaylistData(playlist.id);
        } catch (error) {
            console.error('Failed to refresh playlist:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        // scroll to top when detail view loads
        window.scrollTo(0, 0);
    }, [playlist]);

    /*
     * handleSort
     * Handles sorting when a column header is clicked
     */
    const handleSort = (columnKey) => {
        if (sortBy === columnKey) {
            setIsAscending(!isAscending);
        } else {
            setSortBy(columnKey);
            setIsAscending(true);
        }
    };

    const calculateTopSongValue = (isTopShortTerm, isTopMediumTerm, isTopLongTerm) => {
        let total = 0;
        if (isTopShortTerm) {
            total += 4;
        }
        if (isTopMediumTerm) {
            total += 3;
        }
        if (isTopLongTerm) {
            total += 2;
        }

        return total;
    };

    // memoized sorted songs
    const sortedSongs = useMemo(() => {
        return [...playlistSongs].sort((a, b) => {
            let aVal, bVal;

            switch (sortBy) {
                case 'song':
                    aVal = a.track.name.toLowerCase();
                    bVal = b.track.name.toLowerCase();
                    break;
                case 'artist':
                    aVal = a.track.artists[0].name.toLowerCase();
                    bVal = b.track.artists[0].name.toLowerCase();
                    break;
                case 'album':
                    aVal = a.track.album.name.toLowerCase();
                    bVal = b.track.album.name.toLowerCase();
                    break;
                case 'added':
                    aVal = new Date(a.added_at).getTime();
                    bVal = new Date(b.added_at).getTime();
                    break;
                case 'release':
                    aVal = new Date(a.track.album.release_date).getTime();
                    bVal = new Date(b.track.album.release_date).getTime();
                    break;
                case 'length':
                    aVal = a.track.duration_ms;
                    bVal = b.track.duration_ms;
                    break;
                case 'popularity':
                    aVal = a.track.popularity;
                    bVal = b.track.popularity;
                    break;
                case 'top':
                    aVal = calculateTopSongValue(a.isTopShortTerm, a.isTopMediumTerm, a.isTopLongTerm);
                    bVal = calculateTopSongValue(b.isTopShortTerm, b.isTopMediumTerm, b.isTopLongTerm);
                    break;
                case 'saved':
                    aVal = a.isSaved ? 1 : 0;
                    bVal = b.isSaved ? 1 : 0;
                    break;
                default:
                    aVal = 0;
                    bVal = 0;
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return isAscending ? aVal - bVal : bVal - aVal;
            } else {
                return isAscending
                    ? String(aVal).localeCompare(String(bVal))
                    : String(bVal).localeCompare(String(aVal));
            }
        });
    }, [playlistSongs, sortBy, isAscending]);

    /*
     * getDisplayName
     * Looks up the display name from statMap using the statKey
     */
    const getDisplayName = (statKey) => {
        for (const [displayName, config] of Object.entries(statMap)) {
            if (config.statKey === statKey) {
                return displayName;
            }
        }
        return statKey; // fallback to developer name if not found
    };

    /*
     * renderStatsGroup
     * Renders a stats group table given title, stats, and scores
     */
    const renderStatsGroup = (title, playlistStats, playlistScores, totalScore) => {
        return (
            <div className="stats-group">
                <h3>{title}: {totalScore}</h3>
                <div className="stats-group-container">
                    {Object.entries(playlistStats).map(([key, value]) => {
                        const scoreKey = `${key}Score`;
                        const score = playlistScores && playlistScores[scoreKey];
                        const displayName = getDisplayName(key);
                        
                        let statValue;
                        if (key.includes("mostFrequentArtistBy")) {
                            statValue = `${value?.artistName}: ${value?.artistCount}`;
                        } else if (displayName && statMap[displayName]?.type === "dateTime") {
                            statValue = String(value)?.substring(0, 10) || String(value);
                        } else {
                            statValue = String(value);
                        }

                        return (
                            <div className="stat-box" key={key}>
                                <div className="stat-box-title">{displayName}</div>
                                <div className="stat-box-content">
                                    <div className="stat-box-value">{statValue}</div>
                                    {score !== undefined ? (
                                        <div className="stat-box-score">Score: {score}</div>
                                    ) : <div className="stat-box-score">Score: N/A</div>
                                    }
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const { renderSortArrow } = useRenderUtils();

    return (
        <div className="insights">
            <PageHeader title="Playlist Insights" />
            <button className="backToPlaylistButton" onClick={onBack}>- Back to Playlists</button>
            <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="refresh-button"
                title="Refresh playlist data from Spotify"
            >
                {isRefreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
            </button>
            <header className="insights-header">
                <p>
                    <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">{playlist.name}</a>
                </p>
                <p>
                    {playlist.description}
                </p>
                <img 
                    src={playlist.images[0]?.url} 
                        alt={playlist.name} 
                        style={{ width: "200px", height: "200px", objectFit: "cover", borderRadius: "8px" }}
                />
            </header>
            <div className="insights-body">
                <div className="insights-total-score">
                    <p>{playlistScores.totalScore}</p>
                </div>
                <div className="playlist-stats-and-scores">
                    {renderStatsGroup("Maintenance", playlistStats.maintenance, playlistScores.maintenanceScores, playlistScores.maintenanceScores.totalMaintenanceScore)}
                    {renderStatsGroup("User Relevance", playlistStats.userRelevance, playlistScores.userRelevanceScores, playlistScores.userRelevanceScores.totalUserRelevanceScore)}
                    {renderStatsGroup("General Relevance", playlistStats.generalRelevance, playlistScores.generalRelevanceScores, playlistScores.generalRelevanceScores.totalGeneralRelevanceScore)}
                    {renderStatsGroup("Artist Stats", playlistStats.artistStats, playlistScores.artistDiversityScores, playlistScores.artistDiversityScores.totalArtistDiversityScore)}
                    {renderStatsGroup("Song Stats", { ...playlistStats.songStats, ...playlistStats.advancedSongStats },
                        playlistScores.songLikenessScores, playlistScores.songLikenessScores.totalSongLikenessScore
                    )}
                </div>
                <div className="playlist-song-data">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort('song')}>Song {renderSortArrow('song', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('artist')}>Artist {renderSortArrow('artist', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('album')}>Album {renderSortArrow('album', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('added')}>Song Added Date {renderSortArrow('added', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('release')}>Song Release Date {renderSortArrow('release', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('length')}>Length {renderSortArrow('length', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('popularity')}>Popularity {renderSortArrow('popularity', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('top')}>Top {renderSortArrow('top', sortBy, isAscending)}</th>
                                <th onClick={() => handleSort('saved')}>Saved {renderSortArrow('saved', sortBy, isAscending)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSongs.map((song) => (
                                <tr key={song.track.id}>
                                    <td>{song.track.name}</td>
                                    <td>{song.track.artists[0].name}</td>
                                    <td>{song.track.album.name}</td>
                                    <td>{song.added_at?.substring(0, 10)}</td>
                                    <td>{song.track.album.release_date}</td>
                                    <td>
                                        {Math.floor((song.track.duration_ms / 1000) / 60)}:
                                        {Math.floor((song.track.duration_ms / 1000) % 60)
                                            .toString()
                                            .padStart(2, '0')}
                                    </td>
                                    <td>{song.track.popularity}</td>
                                    <td>{song.isTopShortTerm ? 'S' : ''}{song.isTopMediumTerm ? 'M' : ''}{song.isTopLongTerm ? 'L' : ''}</td>
                                    <td>{song.isSaved ? 'Yes' : 'No'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PlaylistInsights;