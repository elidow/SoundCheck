import React from "react";
import './App.css';
import Navbar from "./navbar/index.js"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlaylistsPage from './pages/PlaylistsPage/PlaylistsPage.js'
import DashboardsPage from './pages/DashboardsPage/DashboardsPage.js'
import TablePage from './pages/TablePage/TablePage.js'

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/playlists" element={<PlaylistsPage />}></Route>
                <Route path="/dashboards" element={<DashboardsPage />}></Route>
                <Route path="/table" element={<TablePage />}></Route>
            </Routes>
        </Router>
    );
}

export default App;