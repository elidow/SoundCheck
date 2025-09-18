import { useMySPStatsContext } from '../context/MySPStatsContext';
import { statMap } from '../util/StatMaps';
import StatTable from '../components/tables/StatTable';
import './TablePage.css';

/*
 * TablePage
 * Functional Component to render multiple stat tables grouped by category
 */
const TablePage = () => {
    const { playlists, playlistStats, loading, error } = useMySPStatsContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>;
    if (error) return <p>Error: {error}</p>;

    // Group stats by category
    const groupedStats = Object.entries(statMap).reduce((acc, [key, value]) => {
        const category = value.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push([key, value]);
        return acc;
    }, {});

    return (
        <div className="Table-Page">
            <header className="Page-Header">
                <p>Spotify Playlist Tables</p>
            </header>
            <div>
                {Object.entries(groupedStats).map(([categoryName, statColumns]) => (
                    <StatTable
                        key={categoryName}
                        categoryName={categoryName}
                        statColumns={statColumns}
                        playlists={playlists}
                        playlistStats={playlistStats}
                    />
                ))}
            </div>
        </div>
    );
};

export default TablePage;