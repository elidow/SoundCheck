import React, { useState, useEffect } from 'react';
import useSpotifyWebApi from './SpotifyWebApi';
import PlaylistItem from './PlaylistItem';

const SpotifyWebService = ({ onDataLoaded }) => {
    const { fetchPlaylists, fetchPlaylistSongs, spotifyError } = useSpotifyWebApi();
    const [playlists, setPlaylists] = useState([]);
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("In Use Effect")
        const loadSpotifyData = async () => {
            console.log("Load Spotify Data")
            const fetchedPlaylists = await fetchPlaylists()
            if (!fetchedPlaylists) {
                setLoading(false);
                return;
            }

            setPlaylists(fetchedPlaylists);
            console.log("Playlists:", playlists)

            // Delay function for throttling requests
            const songsMap = {};
            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            await Promise.all(
                fetchedPlaylists.map(async (playlist, index) => {
                    await delay(index * 100); // Introduces a delay of 250ms per request
                    const songs = await fetchPlaylistSongs(playlist.id);
                    songsMap[playlist.id] = songs || [];
                })
            );

            setPlaylistSongs(songsMap)

            // getting first song
            fetchedPlaylists.map((playlist) => {
                console.log(`First song in Playlist ${playlist.name}:`,
                    (songsMap[playlist.id].length > 0 ? songsMap[playlist.id][0].track.name : "No songs"))
            })

            setLoading(false);
            onDataLoaded();
        }

        loadSpotifyData();
        console.log("Songss:", playlistSongs)

    }, [fetchPlaylists, fetchPlaylistSongs, onDataLoaded])

    if (loading) return <p>Loading playlists and songs to provide insights...</p>;
    if (spotifyError) return <p>Error: {spotifyError}</p>;

    return (
        <div>
            <h1>Spotify Playlists</h1>
            {playlists.length === 0 ? (
                <p>No playlists found.</p>
            ) : (
                playlists.map((playlist) => (
                    <PlaylistItem key={playlist.id} playlist={playlist} />
                ))
            )}
        </div>
    );

}

export default SpotifyWebService;