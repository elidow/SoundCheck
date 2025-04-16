import React from 'react';

const SpotifyStat = ({ stats }) => (
    <div>
        <div>2 Year Old Songs: {stats.twoYearPercentage}%</div>
        <div>6 Month New Songs: {stats.sixMonthPercentage}%</div>
    </div>
);

export default SpotifyStat;