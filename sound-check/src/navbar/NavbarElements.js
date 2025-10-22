import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: #63d471;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    z-index: 12;
`;

export const NavLink = styled(Link)`
    color: #808080;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    padding: 0 1rem;
    height: 100%;
    cursor: pointer;
    font-weight: 500;
    &.active {
        color: rgb(96, 56, 56);
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem; /* more space between tabs */
    flex: 1 1 auto; /* allow center area to grow */
`;

export const Brand = styled.div`
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: 700;
    color: #ffffff;
`;

export const ExternalLink = styled.a`
    color: #ffffff;
    background: transparent;
    border: 1px solid rgba(255,255,255,0.15);
    padding: 8px 12px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 600;
    transition: background 120ms ease, color 120ms ease;
    &:hover{
        background: rgba(255,255,255,0.08);
        color: #000;
    }
`;