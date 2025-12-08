import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';
import './UserPage.css';

/*
 * UserPage
 * Functional Component to render user meta stats
 */
const UserPage = () => {
    const { playlists, playlistStats, metaStats, loading, error } = useSoundCheckContext();

    if (loading) return <p>Spotify Playlist Data is loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div className="User-Page">
            <PageHeader title="User" />
            <h2>User Meta Stats</h2>
            <div className="meta-stats-content">
                {Object.entries(metaStats).map(([key, value]) => (
                    <div key={key}>
                        <strong>{key}:</strong>{' '}
                        {key === "Profile Pic" ? (
                            <img 
                                src={value} 
                                alt="User profile" 
                                style={{ width: '200px', height: 'auto', display: 'block' }} 
                            />
                        ) : (
                            <span>{value}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
};

export default UserPage;