import React from 'react';

const SongItem = ({ song }) => (
    <div>
        <p> Song Name: {song.track.name}</p>
    </div>
);

export default SongItem;