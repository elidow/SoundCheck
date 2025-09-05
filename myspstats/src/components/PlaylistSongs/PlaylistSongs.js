/* PlaylistSongs */
import { React, useEffect } from 'react';
import './PlaylistSongs.css'

/*
 * PlaylistSongs
 * Component representation of playlist songs
 */
const PlaylistSongs = ({playlist, playlistSongs, playlistStats, playlistMetaStats, onBack}) =>  {

    useEffect(() => {
    // scroll to top when detail view loads
        window.scrollTo(0,0);
    }, [playlist]);

    return (
        <div className="playlistSongs">
            <header className="Page-Header">
                <p>
                    {playlist.name} Stats
                </p>
            </header>
            <div>
                <button onClick={onBack}>
                    Back to Playlists
                </button>
            </div>
            {/* <div>
                {playlistMetaStats}
            </div>
            <div>
                {playlistStats}
            </div> */}
            <div className="song-items">
                    <table>
                        <thead>
                            <tr>
                                <th> Song </th>
                                <th> Artist </th>
                                <th> Album </th>
                                <th> Song Added Date </th>
                                <th> Song Release Date </th>
                                <th> Length </th>
                                <th> Popularity </th>
                                <th> Saved </th>
                            </tr>
                        </thead>
                        <tbody>
                        {playlistSongs
                            .map((song) => (
                            <tr key={song.track.id}>
                                <td> {song.track.name} </td>
                                <td> {song.track.artists[0].name} </td>
                                <td> {song.track.album.name} </td>
                                <td> {song.added_at} </td>
                                <td> {song.track.album.release_date} </td>
                                <td> {((song.track.duration_ms / 1000) / 60).toFixed(2)} </td>
                                <td> {song.track.popularity} </td>
                                <td> Maybe? </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
        </div>
    )
}

export default PlaylistSongs;