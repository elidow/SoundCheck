/* PlaylistSongs */
import { React, useEffect } from 'react';
//import { statMap } from '../../util/Maps'; 
import './PlaylistSongs.css';

const PlaylistSongs = ({ playlist, playlistSongs, playlistStats, playlistScores, onBack }) => {

  useEffect(() => {
    // scroll to top when detail view loads
    window.scrollTo(0, 0);
  }, [playlist]);

  const renderStatsGroup = (title, stats, scores) => {
    return (
      <div className="stats-group">
        <h3>{title}</h3>
        <table>
          <tbody>
            {Object.entries(stats).map(([key, value]) => {
              const scoreKey = `${key}Score`; // convention: stat + "Score"
              const score = scores && scores[scoreKey];

              return (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{String(value)}</td>
                  {score !== undefined && <td>Score: {score}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const stats = playlistStats[playlist.id];
  const scores = playlistScores[playlist.id];

  return (
    <div className="playlistSongs">
      <header className="Page-Header">
        <p>{playlist.name} Stats</p>
      </header>
      <div>
        <button onClick={onBack}>Back to Playlists</button>
      </div>

      {/* Stats + Scores */}
      <div className="playlist-stats">
        {renderStatsGroup("Maintenance", stats.maintenance, scores.maintenanceScores)}
        {renderStatsGroup("User Relevance", stats.userRelevance, scores.userRelevanceScores)}
        {renderStatsGroup("General Relevance", stats.generalRelevance, scores.generalRelevanceScores)}
        {renderStatsGroup("Artist Stats", stats.artistStats, scores.artistDiversityScores)}
        {renderStatsGroup("Song Stats", { ...stats.songStats, ...stats.advancedSongStats }, scores.songLikenessScores)}
        
        {/* Total score at the end */}
        <div className="total-score">
          <h3>Total Score</h3>
          <p>{scores.totalScore}</p>
        </div>
      </div>

      {/* Songs table */}
      <div className="song-items">
        <table>
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist</th>
              <th>Album</th>
              <th>Song Added Date</th>
              <th>Song Release Date</th>
              <th>Length</th>
              <th>Popularity</th>
              <th>Saved</th>
            </tr>
          </thead>
          <tbody>
            {playlistSongs.map((song) => (
              <tr key={song.track.id}>
                <td>{song.track.name}</td>
                <td>{song.track.artists[0].name}</td>
                <td>{song.track.album.name}</td>
                <td>{song.added_at}</td>
                <td>{song.track.album.release_date}</td>
                <td>{((song.track.duration_ms / 1000) / 60).toFixed(2)}</td>
                <td>{song.track.popularity}</td>
                <td>Maybe?</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlaylistSongs;