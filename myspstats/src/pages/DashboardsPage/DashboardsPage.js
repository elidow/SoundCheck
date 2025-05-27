/* DashboardsPage */
import React from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import Dashboard from '../../components/Dashboard/Dashboard';
import { statMap } from '../../util/Maps'
import './DashboardsPage.css'

/*
 * DashboardsPage
 * Functional Component to render dashboard page
 */
const DashboardsPage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboard-Page">
            <header className="Page-Header">
                <p>
                    Spotify Playlist Dashboards
                </p>
            </header>
            <div className="Page-Body">
                <div className="dashboard-page-header">
                    <div>Owner: {playlists[0]["owner"]["display_name"]}</div>
                    <div>Number of Playlists: {playlists.length}</div>
                </div>
                <Dashboard name="Song Count" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Song Count"]} />
                <Dashboard name="% Songs >2 Years Old" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["% Songs >2 Years Old"]} />
                <Dashboard name="% Songs <6 Months Old" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["% Songs <6 Months Old"]} />
                <Dashboard name="Last Song Added Date" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Last Song Added Date"]} />
                <Dashboard name="Average Song Added Date" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Average Song Added Date"]} />
                <Dashboard name="Average Song Release Date" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Average Song Release Date"]} />
                <Dashboard name="Most Frequent Artist By Count" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Most Frequent Artist By Count"]}/>
                <Dashboard name="Most Frequent Artist By Percentage" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Most Frequent Artist By Percentage"]}/>
                <Dashboard name="Average Song Duration" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Average Song Duration"]}/>
                <Dashboard name="Average Song Popularity Score" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Average Song Popularity Score"]}/>
            </div>
        </div>
    )
}

export default DashboardsPage;