import React from 'react';
import { FaCog } from 'react-icons/fa';
import './Loading.css';

/*
 * Loading
 * Component to display a spinning gear icon during loading states
 */
const Loading = ({ message }) => {
    return (
        <div className="loading-container">
            <FaCog className="loading-gear" />
            <p>{message}</p>
        </div>
    );
};

export default Loading;