import React from "react";
import './App.css';
import Navbar from "./navbar/index.js";
import PageFooter from './components/common/PageFooter.js';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlaylistsPage from './pages/PlaylistsPage.js'
import DashboardsPage from './pages/DashboardsPage.js'
import TablePage from './pages/TablePage.js'

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/playlists" element={<PlaylistsPage />}></Route>
                <Route path="/dashboards" element={<DashboardsPage />}></Route>
                <Route path="/table" element={<TablePage />}></Route>
            </Routes>
            <PageFooter />
        </Router>
    );
}

export default App;