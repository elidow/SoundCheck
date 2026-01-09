import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar/index.js";
import PageFooter from './components/common/PageFooter.js';
import PlaylistsPage from './pages/PlaylistsPage.js';
import DashboardsPage from './pages/DashboardsPage.js';
import TablesPage from './pages/TablesPage.js';
import UserPage from './pages/UserPage.js';
import CallbackPage from './pages/CallbackPage.js';
import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <Navbar />
                <div className="content">
                    <Routes>
                        <Route path="/" element={<Navigate to="/playlists" replace />} />
                        <Route path="/playlists" element={<PlaylistsPage />}></Route>
                        <Route path="/dashboards" element={<DashboardsPage />}></Route>
                        <Route path="/tables" element={<TablesPage />}></Route>
                        <Route path="/user" element={<UserPage />}></Route>
                        <Route path="*" element={<Navigate to="/playlists" replace />} />
                        <Route path="/callback.html" element={<CallbackPage />} />
                    </Routes>
                </div>
                <PageFooter />
            </div>
        </Router>
    );
}

export default App;