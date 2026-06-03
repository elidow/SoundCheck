import React, { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import {
    Nav,
    NavLink,
    NavMenu,
    Brand,
    ExternalLink,
    HamburgerIcon,
    NavMenuDropdown,
} from "./NavbarElements";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <>
            <Nav>
                <Brand>SoundCheck</Brand>
                <NavMenu isOpen={isMenuOpen}>
                    <NavLink to="/playlists" onClick={closeMenu}>
                        Playlists
                    </NavLink>
                    <NavLink to="/dashboards" activestyle="true" onClick={closeMenu}>
                        Dashboards
                    </NavLink>
                    <NavLink to="/tables" activestyle="true" onClick={closeMenu}>
                        Tables
                    </NavLink>
                    <NavLink to="/user" activestyle="true" onClick={closeMenu}>
                        User
                    </NavLink>
                </NavMenu>
                <ExternalLink href="https://open.spotify.com" target="_blank" rel="noopener noreferrer">Go to Spotify</ExternalLink>
                <HamburgerIcon onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes /> : <FaBars />}
                </HamburgerIcon>
            </Nav>
        </>
    );
};

export default Navbar;
