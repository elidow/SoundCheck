import React from "react";
import {
    Nav,
    NavLink,
    NavMenu,
    Brand,
    ExternalLink,
} from "./NavbarElements";

const Navbar = () => {
    return (
        <>
            <Nav>
                <Brand>SoundCheck</Brand>
                <NavMenu>
                    <NavLink to="/playlists" >
                        Playlists
                    </NavLink>
                    <NavLink to="/dashboards" activestyle="true">
                        Dashboards
                    </NavLink>
                    <NavLink to="/table" activestyle="true">
                        Table
                    </NavLink>
                </NavMenu>
                <ExternalLink href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">Go to Spotify</ExternalLink>
            </Nav>
        </>
    );
};

export default Navbar;
