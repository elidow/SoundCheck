import { createContext, useContext, useState, useEffect } from 'react';
import PlaylistDataManagerService from '../services/data-management/PlaylistDataManagerService';

const SoundCheckContext = createContext();

export const SoundCheckProvider = ({ children }) => {
    const [playlists, setPlaylists] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [playlistStats, setPlaylistStats] = useState([]);
    const [playlistScores, setPlaylistScores] = useState([]);
    const [metaStats, setMetaStats] = useState([]);
    const [topSongs, setTopSongs] = useState(null);
    const [savedSongs, setSavedSongs] = useState([]);
    const [recentlyPlayedSongs, setRecentlyPlayedSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { retrieveAllData, refreshSinglePlaylist } = PlaylistDataManagerService();

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await retrieveAllData();
                setPlaylists(data.playlists);
                setPlaylistSongs(data.playlistSongs);
                setPlaylistStats(data.playlistStats);
                setPlaylistScores(data.playlistScores);
                setMetaStats(data.metaStats);
                // Store the underlying data needed for targeted refreshes
                data.topSongs && setTopSongs(data.topSongs);
                data.savedSongs && setSavedSongs(data.savedSongs);
                data.recentlyPlayedSongs && setRecentlyPlayedSongs(data.recentlyPlayedSongs);
                setError(null);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }     
        };

        loadData();
    }, []);

    /*
     * refreshPlaylistData
     * Function to re-fetch updated playlist data for a specific playlist only
     */
    const refreshPlaylistData = async (playlistId) => {
        try {
            const freshData = await refreshSinglePlaylist(playlistId, topSongs, savedSongs, recentlyPlayedSongs);

            // Update only the affected playlist's data
            setPlaylistSongs(prev => ({ ...prev, [playlistId]: freshData.songs }));
            setPlaylistStats(prev => ({ ...prev, [playlistId]: freshData.stats}));
            setPlaylistScores(prev => ({ ...prev, [playlistId]: freshData.scores }));

            setError(null);
            return freshData;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return (
        <SoundCheckContext.Provider value={{ playlists, playlistSongs, playlistStats, playlistScores, metaStats, loading, error, refreshPlaylistData }}>
            {children}
        </SoundCheckContext.Provider>
    );
}

export const useSoundCheckContext = () => {
    return useContext(SoundCheckContext);
};