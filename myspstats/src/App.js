import React from "react";
import './App.css';
import Navbar from "./navbar/index.js"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardsPage from './pages/DashboardsPage/DashboardsPage.js'
import TablePage from './pages/TablePage/TablePage.js'

function App() {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<DashboardsPage />}></Route>
                <Route path="/table" element={<TablePage />}></Route>
            </Routes>
        </Router>
    );
}

export default App;