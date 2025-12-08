import { useSoundCheckContext } from '../context/SoundCheckContext';
import PageHeader from '../components/common/PageHeader';

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
            <PageHeader title="Users" />
            <h2>User Meta Stats</h2>

            {Object.entries(metaStats).map(([key, value]) => (
                <div key={key}>
                    <strong>{key}:</strong>{' '}
                    {key === "Profile Pic" ? (
                        <img 
                            src={value} 
                            alt="User profile" 
                            style={{ width: '100px', height: '100px', borderRadius: '8px' }} 
                        />
                    ) : (
                        <span>{value}</span>
                    )}
                </div>
            ))}
        </div>
    )
};

export default UserPage;