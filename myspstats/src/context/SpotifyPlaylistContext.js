import React, { createContext, useContext, useState, useEffect } from 'react';
import SpotifyWebService from '../services/Spotify/SpotifyWebService';

const SpotifyPlaylistContext = createContext();

export const SpotifyPlaylistProvider = ({ children }) => {
    const { retrievePlaylistsWithStats } = SpotifyWebService();

    const [playlists, setPlaylists] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [playlistStats, setPlaylistStats] = useState([]);
    const [playlistMetaStats, setPlaylistMetaStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Spotify Playlist Context: In Use Effect")
        const loadData = async () => {
            try {
                const { playlists, playlistSongs, playlistStats, playlistMetaStats } = await retrievePlaylistsWithStats();

                setPlaylists(playlists);
                setPlaylistSongs(playlistSongs);
                setPlaylistStats(playlistStats);
                setPlaylistMetaStats(playlistMetaStats);
            } catch (err) {
                setLoading(false);
                setError(err.message);
            } finally {
                setLoading(false);
            }     
        };

        loadData();
    }, []);

    return (
        <SpotifyPlaylistContext.Provider value={{ playlists, playlistSongs, playlistStats, playlistMetaStats, loading, error }}>
            {children}
        </SpotifyPlaylistContext.Provider>
    );
}

export const useSpotifyPlaylistContext = () => {
    return useContext(SpotifyPlaylistContext);
};