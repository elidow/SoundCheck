import React from "react";
import {
    Nav,
    NavLink,
    NavMenu,
} from "./NavbarElements";

const Navbar = () => {
    return (
        <>
            <Nav>
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
            </Nav>
        </>
    );
};

export default Navbar;
