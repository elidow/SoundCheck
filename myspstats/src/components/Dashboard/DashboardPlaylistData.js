/* DashboardPlaylistData */

import React from 'react';

/* 
 * Playlist Item
 * Representation for playlist data
 */
const DashboardPlaylistData = ({ playlist }) => (
    <div className="dashboard-playlist-data">
        <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            {playlist.name}
        </a>
    </div>
);

export default DashboardPlaylistData;