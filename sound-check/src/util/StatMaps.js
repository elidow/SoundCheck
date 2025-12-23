const number = "number";
const percentage = "percentage";
const dateTime = "dateTime";
const artist = "artist";
const time = "time";

export const statMap = {
    "Song Count": {
        category: "maintenance",
        statKey: "songCount",
        type: number,
    },
    "% Songs >2 Years Old": {
        category: "maintenance",
        statKey: "twoYearOldPercentage",
        type: percentage,
    },
    "% Songs <6 Months Old": {
        category: "maintenance",
        statKey: "sixMonthNewPercentage",
        type: percentage,
    },
    "Average Song Added Date": {
        category: "maintenance",
        statKey: "avgSongAddedDate",
        type: dateTime,
    },
    "Last Song Added Date": {
        category: "maintenance",
        statKey: "lastSongAddedDate",
        type: dateTime,
    },
    "% Songs in Most Played Short Term": {
        category: "userRelevance",
        statKey: "shortTermMostPlayedPercentage",
        type: percentage,
    },
    "% Songs in Most Played Medium Term": {
        category: "userRelevance",
        statKey: "mediumTermMostPlayedPercentage",
        type: percentage,
    },
    "% Songs in Most Played Long Term": {
        category: "userRelevance",
        statKey: "longTermMostPlayedPercentage",
        type: percentage,
    },
    "% Songs in Saved Songs": {
        category: "userRelevance",
        statKey: "savedSongPercentage",
        type: percentage,
    },
    "Times Recently Played": {
        category: "userRelevance",
        statKey: "timesRecentlyPlayed",
        type: number,
    },
    "Average Song Release Date": {
        category: "generalRelevance",
        statKey: "avgSongReleaseDate",
        type: dateTime,
    },
    "Average Song Popularity": {
        category: "generalRelevance",
        statKey: "avgSongPopularity",
        type: number,
    },
    "Artist Diversity": {
        category: "artistStats",
        statKey: "artistDiversity",
        type: number,
    },
    "Most Frequent Artist By Percentage": {
        category: "artistStats",
        statKey: "mostFrequentArtistByPercentage",
        type: artist + ", " + percentage,
    },
    "Most Frequent Artist By Count": {
        category: "artistStats",
        statKey: "mostFrequentArtistByCount",
        type: artist + ", " + number,
    },
    "Average Song Duration": {
        category: "songStats",
        statKey: "avgSongDuration",
        type: time,
    },
    "Song Duration Variance": {
        category: "advancedSongStats",
        statKey: "songDurationVariance",
        type: number,
    },
    "Song Release Date Variance": {
        category: "advancedSongStats",
        statKey: "songReleaseDateVariance",
        type: number,
    },
};

export const categoryDisplayNames = {
    maintenance: "Maintenance",
    userRelevance: "User Relevance",
    generalRelevance: "General Relevance",
    artistStats: "Artist Stats",
    songStats: "Song Stats",
    advancedSongStats: "Advanced Song Stats",
};