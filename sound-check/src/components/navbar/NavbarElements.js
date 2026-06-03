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
    border-bottom: 2px solid black;
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

    @media screen and (max-width: 768px) {
        padding: 1rem 0;
        height: auto;
        display: block;
        color: #ffffff;
        &.active {
            color: rgb(96, 56, 56);
        }
    }
`;

export const NavMenu = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    flex: 1 1 auto;

    @media screen and (max-width: 768px) {
        flex-direction: column;
        width: 100%;
        position: absolute;
        top: 80px;
        left: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        background: #63d471;
        border-bottom: 2px solid black;
        padding: 0;
        gap: 0;

        ${props =>
            props.isOpen &&
            `
            max-height: 500px;
            padding: 1.5rem 0;
            transition: max-height 0.3s ease;
            z-index: 1;
        `}
    }
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

    @media screen and (max-width: 768px) {
        display: none;
    }
`;

export const HamburgerIcon = styled.div`
    display: none;
    color: #ffffff;
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.3s ease;

    @media screen and (max-width: 768px) {
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
    }

    &:hover {
        transform: scale(1.1);
    }
`;

export const NavMenuDropdown = styled.div``;
