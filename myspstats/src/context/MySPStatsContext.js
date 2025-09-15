import React, { createContext, useContext, useState, useEffect } from 'react';
import MySPStatsService from '../services/playlistDataManager/PlaylistDataManagerService';

const MySPStatsContext = createContext();

export const MySPStatsProvider = ({ children }) => {
    const { retrieveAllData } = MySPStatsService();

    const [playlists, setPlaylists] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [playlistStats, setPlaylistStats] = useState([]);
    const [playlistScores, setPlaylistScores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("Spotify Playlist Context: In Use Effect")
        const loadData = async () => {
            try {
                const { playlists, playlistSongs, playlistStats, playlistScores } = await retrieveAllData();

                setPlaylists(playlists);
                setPlaylistSongs(playlistSongs);
                setPlaylistStats(playlistStats);
                setPlaylistScores(playlistScores);
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
        <MySPStatsContext.Provider value={{ playlists, playlistSongs, playlistStats, playlistScores, loading, error }}>
            {children}
        </MySPStatsContext.Provider>
    );
}

export const useMySPStatsContext = () => {
    return useContext(MySPStatsContext);
};