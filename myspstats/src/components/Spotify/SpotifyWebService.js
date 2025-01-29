import React, { useEffect } from 'react';
import useSpotifyWebApi from './SpotifyWebApi';
import PlaylistItem from './PlaylistItem';

const SpotifyWebService = ({ onDataLoaded }) => {
    const { accessToken, playlists, loading, error, loginUrl } = useSpotifyWebApi();

    // Notify parent component when data is loaded
    useEffect(() => {
        if (!loading && playlists.length > 0) {
            console.log("Data loaded")
            onDataLoaded();
        }
    }, [loading, playlists, onDataLoaded]);

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
        {loading ? (
            <p>Loading playlists...</p>
        ) : error ? (
            <p>Error: {error}</p>
        ) : (
            <ul>
                {playlists.map((playlist) => (
                    <PlaylistItem key={playlist.id} playlist={playlist} />
                ))}
            </ul>
        )}
    </div>
  );
};

export default SpotifyWebService;