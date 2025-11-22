/* PlaylistInsights */
import { useEffect, useState, useMemo } from 'react';
import useRenderUtils from '../../util/RenderUtils';
import './PlaylistInsights.css';

/*
 * PlaylistInsights
 * Component for rendering playlist insights including stats, scores, and song data
 */
const PlaylistInsights = ({ playlist, playlistSongs, playlistStats, playlistScores, onBack }) => {
    const [sortBy, setSortBy] = useState('trackNumber');
    const [isAscending, setIsAscending] = useState(true);

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
     * renderStatsGroup
     * Renders a stats group table given title, stats, and scores
     */
    const renderStatsGroup = (title, playlistStats, playlistScores) => {
        return (
            <div className="stats-group">
                <h3>{title}</h3>
                <table>
                    <tbody>
                        {Object.entries(playlistStats).map(([key, value]) => {
                            const scoreKey = `${key}Score`;
                            const score = playlistScores && playlistScores[scoreKey];

                            return (
                                <tr className="stats-group-row" key={key}>
                                    <td>{key}</td>
                                    {key.includes("mostFrequentArtistBy") ? (
                                        <td>
                                            {value?.artistName}: {value?.artistCount}
                                        </td>
                                    ) : (
                                        <td>{String(value)}</td>
                                    )}
                                    {score !== undefined && <td>Score: {score}</td>}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    };

    const { renderSortArrow } = useRenderUtils();

    return (
        <div className="insights">
            <header className="insights-header">
                <p>
                    <div>
                        <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                            {playlist.name}
                        </a>
                    </div>
                    <div>Insights</div>
                </p>
            </header>
            <div className="insights-body">
                <button onClick={onBack}>Back to Playlists</button>
                <div className="playlist-stats-and-scores">
                    {renderStatsGroup("Maintenance", playlistStats.maintenance, playlistScores.maintenanceScores)}
                    {renderStatsGroup("User Relevance", playlistStats.userRelevance, playlistScores.userRelevanceScores)}
                    {renderStatsGroup("General Relevance", playlistStats.generalRelevance, playlistScores.generalRelevanceScores)}
                    {renderStatsGroup("Artist Stats", playlistStats.artistStats, playlistScores.artistDiversityScores)}
                    {renderStatsGroup(
                        "Song Stats",
                        { ...playlistStats.songStats, ...playlistStats.advancedSongStats },
                        playlistScores.songLikenessScores
                    )}
                    <div className="total-score">
                        <h3>Total Score</h3>
                        <p>{playlistScores.totalScore}</p>
                    </div>
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
                                <th onClick={() => handleSort('saved')}>Saved {renderSortArrow('saved', sortBy, isAscending)}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSongs.map((song, index) => (
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