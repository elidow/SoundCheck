import React, { createContext, useContext, useState, useEffect } from 'react';
import PlaylistDataManagerService from '../services/playlistDataManager/PlaylistDataManagerService';

const SoundCheckContext = createContext();

export const SoundCheckProvider = ({ children }) => {
    const { retrieveAllData } = PlaylistDataManagerService();

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
        <SoundCheckContext.Provider value={{ playlists, playlistSongs, playlistStats, playlistScores, loading, error }}>
            {children}
        </SoundCheckContext.Provider>
    );
}

export const useSoundCheckContext = () => {
    return useContext(SoundCheckContext);
};