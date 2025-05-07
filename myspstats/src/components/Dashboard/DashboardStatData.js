import React from 'react';

const DashboardStatData = ({ stats, statKey }) => (
    <div className="dashboard-stat-data">
        <div>{stats[statKey]}%</div>
    </div>
);

export default DashboardStatData;