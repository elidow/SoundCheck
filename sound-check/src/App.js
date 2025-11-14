import React from "react";
import './App.css';
import Navbar from "./components/navbar/index.js";
import PageFooter from './components/common/PageFooter.js';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlaylistsPage from './pages/PlaylistsPage.js'
import DashboardsPage from './pages/DashboardsPage.js'
import TablePage from './pages/TablePage.js'

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="content">
                    <Routes>
                        <Route path="/playlists" element={<PlaylistsPage />}></Route>
                        <Route path="/dashboards" element={<DashboardsPage />}></Route>
                        <Route path="/table" element={<TablePage />}></Route>
                    </Routes>
                </div>
                <PageFooter />
            </div>
        </Router>
    );
}

export default App;