import { useState } from 'react';
import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';
import StatTable from '../components/tables/StatTable';
import { statMap, categoryDisplayNames } from '../util/StatMaps';
import './TablesPage.css';

/*
 * TablesPage
 * Functional Component to render multiple stat tables grouped by category
 */
const TablesPage = () => {
    const { playlists, playlistStats, loading, error } = useSoundCheckContext();
    const [selectedCategory, setSelectedCategory] = useState(null);

    if (loading) return <p>Spotify Playlist Data is loading...</p>;
    if (error) return <p>Error: {error}</p>;

    // Group stats by category
    const groupedStats = Object.entries(statMap).reduce((acc, [key, value]) => {
        const category = value.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push([key, value]);
        return acc;
    }, {});

    // Default to first category if none selected yet
    const categoryNames = Object.keys(groupedStats);
    if (!selectedCategory && categoryNames.length > 0) {
        setSelectedCategory(categoryNames[0]);
    }

    /*
     * getDisplayName
     * Looks up the display name from statMap using the statKey
     */
    const getDisplayName = (categoryName) => {
        if (categoryName === "maintenance") {
            return "Maintenance";
        } else if (categoryName === "userRelevance") {
            return "User Relevance";
        } else if (categoryName === "generalRelevance") {
            return "General Relevance";
        } else if (categoryName === "artistStats") {
            return "Artist Stats";
        } else if (categoryName === "songStats") {
            return "Song Stats";
        } else if (categoryName === "advancedSongStats") {
            return "Advanced Song Stats";
        }
        return categoryName; // fallback to developer name if not found
    };

    return (
        <div className="Tables-Page">
            <PageHeader title="Tables" />

            {/* Category Tabs */}
            <div className="Category-Tabs">
                {categoryNames.map((categoryName) => (
                    <button
                        key={categoryName}
                        className={`Category-Tab ${selectedCategory === categoryName ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(categoryName)}
                    >
                        {categoryDisplayNames[categoryName]}
                    </button>
                ))}
            </div>

            {/* Display only the selected StatTable */}
            {selectedCategory && (
                <StatTable
                    key={selectedCategory}
                    categoryName={selectedCategory}
                    statColumns={groupedStats[selectedCategory]}
                    playlists={playlists}
                    playlistStats={playlistStats}
                />
            )}
        </div>
    );
};

export default TablesPage;