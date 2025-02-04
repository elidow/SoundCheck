import React, { useEffect } from 'react';
import {useAccessToken, useSpotifyPlaylists, useSpotifySongs} from './SpotifyWebApi';
import PlaylistItem from './PlaylistItem';
import SongItem from './SongItem';

const SpotifyWebService = ({ onDataLoaded }) => {
    const { accessToken, loginUrl} = useAccessToken();
    const { playlists, playlistLoading, playlistError} = useSpotifyPlaylists(accessToken);
    const { songs, songLoading, songError} = useSpotifySongs(accessToken, "3DeRYfh6fsMk1wIqwkzFFu");

    // Notify parent component when data is loaded
    useEffect(() => {
        if (!playlistLoading && playlists.length > 0 && !songLoading/* && songs.length > 0*/) {
            console.log("Data loaded")
            console.log(playlists)
            console.log(songs)
            onDataLoaded();
        }
    }, [playlistLoading, playlists, songLoading, songs, onDataLoaded]);

    if (!accessToken) {
        return (
            <div>
                <a href={loginUrl}>
                    <button>Login to Spotify</button>
                </a>
            </div>
        );
    }

    return (
    <div>
        <h1>Spotify Playlists</h1>
        {playlistLoading ? (
            <p>Loading playlists...</p>
        ) : playlistError ? (
            <p>Error: {playlistError}</p>
        ) : (
            <ul>
                {playlists.map((playlist) => (
                    <PlaylistItem key={playlist.id} playlist={playlist} />
                ))}
            </ul>
        )}
        <h2>Spotify Songs for Keeping Rap Alive</h2>
        {songLoading ? (
            <p>Loading songs...</p>
        ) : songError ? (
            <p>Error: {songError}</p>
        ) : (
            <ul>
                {songs.map((song) => (
                    <SongItem key={song.track.id} song={song} />
                ))}
            </ul>
        )}
    </div>
  );
};

export default SpotifyWebService;