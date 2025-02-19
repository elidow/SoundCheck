import React, { useState } from "react";
import SpotifyWebService from '../../services/Spotify/SpotifyWebService';
import spotifyIcon from '../../images/spotifyIcon.svg';

export default function Dashboards() {
    const [showLogo, setShowLogo] = useState(true);

    const handleDataLoaded = () => {
        setShowLogo(false);
    };

    return (
        <div className="Dashboards">
            <header className="App-header">
                <p>
                    MySPStats
                </p>
            </header>
            <div className="App-body">
                {showLogo && (
                    <div className="App-loading">
                    <img src={spotifyIcon} className="App-logo" alt="logo" />
                    <p>
                        SP Stats loading...
                    </p>
                    </div>
                )}
            <SpotifyWebService onDataLoaded={handleDataLoaded} />
            </div>
        </div>
    )
}