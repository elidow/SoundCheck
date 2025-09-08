import React, { createContext, useContext, useState, useEffect } from 'react';
import MySPStatsService from '../services/playlistDataManager/PlaylistDataManagerService';

const MySPStatsContext = createContext();

export const MySPStatsProvider = ({ children }) => {
    const { retrieveAllData } = MySPStatsService();

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
                const { playlists, playlistSongs, playlistStats, playlistMetaStats } = await retrieveAllData();

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
        <MySPStatsContext.Provider value={{ playlists, playlistSongs, playlistStats, playlistMetaStats, loading, error }}>
            {children}
        </MySPStatsContext.Provider>
    );
}

export const useMySPStatsContext = () => {
    return useContext(MySPStatsContext);
};