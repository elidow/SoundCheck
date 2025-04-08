import React from 'react';

const PlaylistItem = ({ playlist }) => (
    <div>
        <a href={playlist.external_urls.spotify} target="_blank" rel="noopener noreferrer">
            {playlist.name}
        </a>
        <p>Tracks: {playlist.tracks.total}</p>
    </div>
);

export default PlaylistItem;