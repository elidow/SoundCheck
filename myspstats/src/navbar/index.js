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
                    <NavLink to="/" >
                        Dashboard
                    </NavLink>
                    <NavLink to="/table" activeStyle>
                        Table
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};

export default Navbar;
