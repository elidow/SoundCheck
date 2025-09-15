/* PlaylistSongs */
import { React, useEffect } from 'react';
//import { statMap } from '../../util/Maps'; 
import './PlaylistInsights.css';

const PlaylistInsights = ({ playlist, playlistSongs, playlistStats, playlistScores, onBack }) => {

  useEffect(() => {
    // scroll to top when detail view loads
    window.scrollTo(0, 0);
  }, [playlist]);

  const renderStatsGroup = (title, playlistStats, playlistScores) => {
    return (
      <div className="stats-group">
        <h3>{title}</h3>
        <table>
          <tbody>
            {Object.entries(playlistStats).map(([key, value]) => {
              const scoreKey = `${key}Score`; // convention: stat + "Score"
              const score = playlistScores && playlistScores[scoreKey];

              return (
                <tr className="stats-group-row" key={key}>
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

  return (
    <div className="insights">
      <header className="insights-header">
        <p>{playlist.name} Insights</p>
      </header>
      <div className="insights-body">
        <button onClick={onBack}>Back to Playlists</button>
        {/* Stats + Scores */}
        <div className="playlist-stats-and-scores">
          {renderStatsGroup("Maintenance", playlistStats.maintenance, playlistScores.maintenanceScores)}
          {renderStatsGroup("User Relevance", playlistStats.userRelevance, playlistScores.userRelevanceScores)}
          {renderStatsGroup("General Relevance", playlistStats.generalRelevance, playlistScores.generalRelevanceScores)}
          {renderStatsGroup("Artist Stats", playlistStats.artistStats, playlistScores.artistDiversityScores)}
          {renderStatsGroup("Song Stats", { ...playlistStats.songStats, ...playlistStats.advancedSongStats }, playlistScores.songLikenessScores)}
          
          {/* Total score at the end */}
          <div className="total-score">
            <h3>Total Score</h3>
            <p>{playlistScores.totalScore}</p>
          </div>
        </div>
        {/* Songs table */}
        <div className="playlist-song-data">
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
    </div>
  );
};

export default PlaylistInsights;