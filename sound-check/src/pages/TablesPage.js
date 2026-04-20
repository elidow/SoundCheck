import { useState } from 'react';
import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';
import Loading from '../components/common/Loading';
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

    if (loading) return <Loading message={loading} />;
    if (error) return <p>Error: {error}</p>;

    // Group stats by category
    const groupedStats = Object.entries(statMap).reduce((acc, [key, value]) => {
        const category = value.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push([key, value]);
        return acc;
    }, {});

    // Combine songStats and advancedSongStats into songStats
    if (groupedStats['songStats'] && groupedStats['advancedSongStats']) {
        groupedStats['songStats'] = [...groupedStats['songStats'], ...groupedStats['advancedSongStats']];
        delete groupedStats['advancedSongStats'];
    }

    // Default to first category if none selected yet
    const categoryNames = Object.keys(groupedStats);
    if (!selectedCategory && categoryNames.length > 0) {
        setSelectedCategory(categoryNames[0]);
    }

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