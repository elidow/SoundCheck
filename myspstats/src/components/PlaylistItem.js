/* PlaylistItem */

import React from 'react';

/* 
 * Playlist Item
 * Representation for playlist data
 */
const PlaylistItem = ({ playlist }) => (
    <div>
        <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            {playlist.name}
        </a>
        <p>Tracks: {playlist.tracks.total}</p>
    </div>
);

export default PlaylistItem;