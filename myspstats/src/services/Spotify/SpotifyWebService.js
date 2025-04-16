import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';

const SpotifyWebService = () => {
    const { fetchPlaylists, fetchPlaylistSongs } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage } = useCalculatePlaylistStatsService();

    const retrievePlaylistsWithStats = async () => {
        try {
            console.log("Retrieving Playlists with Stats");
    
            const playlists = await fetchPlaylists();
            if (!playlists) throw new Error("Failed to fetch playlists")
            console.log("Playlists:", playlists);

            // Delay function for throttling requests
            const playlistSongs = {};
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            await Promise.all(
                playlists.map(async (playlist, index) => {
                    await delay(index * 200); // Introduces a delay of 200ms per request
                    const songs = await fetchPlaylistSongs(playlist.id);
                    playlistSongs[playlist.id] = songs || [];
                })
            );

            // calculating 2 years
            const playlistStats = {}
            const today = new Date();
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const zeroDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});

            console.log(twoYearsAgo)
            playlists.map((playlist) => {
                if (playlist) playlistStats[playlist.id] = {
                    "twoYearPercentage" : calculateSongTimeRangePercentage(playlistSongs[playlist.id] || [], "2000-01-01", twoYearsAgo),
                    "sixMonthPercentage": calculateSongTimeRangePercentage(playlistSongs[playlist.id] || [], sixMonthsAgo, zeroDaysAgo),
                    "lastSongAdded": (playlistSongs[playlist.id].length > 0 ? playlistSongs[playlist.id][playlistSongs[playlist.id].length - 1].added_at : "No songs")
                }
            });

            for (const key in playlistStats) {
                console.log(`Stats for Playlist ${key}`, playlistStats[key]);
            }

            return { playlists, playlistStats }
        } catch (error) {
            console.error("Error in service")
            throw error;
        }
    };

    return { retrievePlaylistsWithStats }
}

export default SpotifyWebService;