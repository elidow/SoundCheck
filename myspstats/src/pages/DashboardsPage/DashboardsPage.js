/* DashboardsPage */
import React from 'react';
import { useSpotifyPlaylistContext } from '../../context/SpotifyPlaylistContext';
import Dashboard from '../../components/Dashboard/Dashboard';
import { statMap } from '../../util/Maps'
import './DashboardsPage.css'

/*
 * DashboardsPage
 * Functional Component to render dashboards page
 */
const DashboardsPage = () =>  {
    const { playlists, playlistStats, loading, error } = useSpotifyPlaylistContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="Dashboards-Page">
            <header className="Page-Header">
                <p>
                    Spotify Playlist Dashboards
                </p>
            </header>
            <div className="Page-Body">
                <div className="dashboards-page-header">
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
                <Dashboard name="% Songs in Top Short Term Songs" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["% Songs in Top Short Term Songs"]}/>
                <Dashboard name="% Songs in Top Medium Term Songs" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["% Songs in Top Medium Term Songs"]}/>
                <Dashboard name="% Songs in Top Long Term Songs" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["% Songs in Top Long Term Songs"]}/>
                <Dashboard name="Artist Diversity Score" playlists={playlists} playlistStats={playlistStats} statDetails={statMap["Artist Diversity Score"]}/>
            </div>
        </div>
    )
}

export default DashboardsPage;