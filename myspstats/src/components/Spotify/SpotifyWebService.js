import React, { useState, useEffect } from 'react';
import useSpotifyWebApi from './SpotifyWebApi';
import useCalculatePlaylistStatsService from './CalculatePlaylistStatsService';
import PlaylistItem from './PlaylistItem';
import SpotifyStat from './SpotifyStat';
import './Spotify.css';

const SpotifyWebService = ({ onDataLoaded }) => {
    const { fetchPlaylists, fetchPlaylistSongs, spotifyError } = useSpotifyWebApi();
    const { calculateSongTimeRangePercentage } = useCalculatePlaylistStatsService();

    const [playlists, setPlaylists] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [songStats, setSongStats] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("In Use Effect")
        const loadSpotifyData = async () => {
            console.log("Load Spotify Data");
            const fetchedPlaylists = await fetchPlaylists();
            if (!fetchedPlaylists) {
                setLoading(false);
                return;
            }

            setPlaylists(fetchedPlaylists);
            console.log("Playlists:", playlists);

            // Delay function for throttling requests
            const songsMap = {};
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            await Promise.all(
                fetchedPlaylists.map(async (playlist, index) => {
                    await delay(index * 200); // Introduces a delay of 200ms per request
                    const songs = await fetchPlaylistSongs(playlist.id);
                    songsMap[playlist.id] = songs || [];
                })
            );

            setPlaylistSongs(songsMap)

            // getting last song
            fetchedPlaylists.map((playlist) => {
                console.log(`Last song in Playlist ${playlist.name}:`,
                    (songsMap[playlist.id].length > 0 ? songsMap[playlist.id][songsMap[playlist.id].length - 1].track.name : "No songs"))
            })

            // calculating 2 years
            const fetchSongStats = {}
            const today = new Date();
            const twoYearsAgo = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});
            const zeroDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toLocaleDateString("fr-CA", {year:"numeric", month: "2-digit", day:"2-digit"});

            console.log(twoYearsAgo)
            fetchedPlaylists.map((playlist) => {
                if (playlist) fetchSongStats[playlist.id] = {
                    "twoYearPercentage" : calculateSongTimeRangePercentage(songsMap[playlist.id] || [], "2000-01-01", twoYearsAgo),
                    "sixMonthPercentage": calculateSongTimeRangePercentage(songsMap[playlist.id] || [], sixMonthsAgo, zeroDaysAgo)
                }
            });

            for (const key in fetchSongStats) {
                console.log(`Stats for Playlist ${key}`, fetchSongStats[key]);
            }

            setSongStats(fetchSongStats);

            setLoading(false);
            onDataLoaded();
        }

        loadSpotifyData();
        console.log("Songss:", playlistSongs)

    }, [fetchPlaylists, fetchPlaylistSongs, onDataLoaded]);

    function sortBy2Years() { // use UseMemo for optimized computation of a function
        const sortedPlaylists = [...playlists].sort((a,b) => {
            return (songStats[b.id]?.twoYearPercentage ?? 0) - (songStats[a.id]?.twoYearPercentage ?? 0)
        });
        setPlaylists(sortedPlaylists)
    }

    function sortBy6Months() {
        const sortedPlaylists = [...playlists].sort((a,b) => {
            return (songStats[b.id]?.sixMonthPercentage ?? 0) - (songStats[a.id]?.sixMonthPercentage ?? 0)
        });
        setPlaylists(sortedPlaylists)
    }

    if (loading) return <p>Loading playlists and songs to provide insights...</p>;
    if (spotifyError) return <p>Error: {spotifyError}</p>;

    return (
        <div>
            <h1>Spotify Playlists Stats</h1>
            <button onClick={sortBy2Years}>Sort By 2 Years</button>
            <button onClick={sortBy6Months}>Sort By 6 Months</button>
            {playlists.length === 0 ? (
                <p>No playlists found.</p>
            ) : (
                playlists.map((playlist) => (
                    <div className="playlistItem">
                        <PlaylistItem key={playlist.id} playlist={playlist} />
                        {songStats[playlist.id] ? (
                            <SpotifyStat stats={songStats[playlist.id]} />
                        ) : (
                            <p>No stats available</p>
                        )}
                    </div>
                ))
            )}
        </div>
    );

}

export default SpotifyWebService;