const number = "number";
const percentage = "percentage";
const dateTime = "dateTime";
const artist = "artist";
const time = "time";
const squaredMinutes = "squaredMinutes"
const squaredDays = "squaredDays"

export const statMap = {
    totalSongs: {
        category: "maintenance",
        displayName: "Total Songs",
        description: "The total number of songs in this playlist",
        statKey: "totalSongs",
        type: number,
    },
    oldSongsPercentage: {
        category: "maintenance",
        displayName: "Old Songs (>2 Years)",
        description: "The percentage of songs added to this playlist more than 2 years ago",
        statKey: "oldSongsPercentage",
        type: percentage,
    },
    newSongsPercentage: {
        category: "maintenance",
        displayName: "New Songs (<6 Months)",
        description: "The percentage of songs added to this playlist less than 6 months ago",
        statKey: "newSongsPercentage",
        type: percentage,
    },
    averageAddedDate: {
        category: "maintenance",
        displayName: "Average Added Date",
        description: "The average date songs were added to a playlist",
        statKey: "averageAddedDate",
        type: dateTime,
    },
    lastAddedDate: {
        category: "maintenance",
        displayName: "Last Added Date",
        description: "The date the newest song was added to the playlist",
        statKey: "lastAddedDate",
        type: dateTime,
    },
    topSongsShortTermPercentage: {
        category: "userRelevance",
        displayName: "Top Songs (Last 4 Weeks)",
        description: "The percentage of songs in this playlist that also appear in your most-played songs from the last 4 weeks",
        statKey: "topSongsShortTermPercentage",
        type: percentage,
    },
    topSongsMediumTermPercentage: {
        category: "userRelevance",
        displayName: "Top Songs (Last 6 Months)",
        description: "The percentage of songs in this playlist that also appear in your most-played songs from the last 6 months",
        statKey: "topSongsMediumTermPercentage",
        type: percentage,
    },
    topSongsLongTermPercentage: {
        category: "userRelevance",
        displayName: "Top Songs (Last Year)",
        description: "The percentage of songs in this playlist that also appear in your most-played songs from the last year",
        statKey: "topSongsLongTermPercentage",
        type: percentage,
    },
    savedSongPercentage: {
        category: "userRelevance",
        displayName: "Saved Songs",
        description: "The percentage of songs in this playlist that also appear in your saved songs",
        statKey: "savedSongPercentage",
        type: percentage,
    },
    recentlyPlayedCount: {
        category: "userRelevance",
        displayName: "Recent Plays",
        description: "An estimate of how often you have listened to this playlist recently. A “play” is counted when 4 or more songs from the playlist appear consecutively in your recent listening history",
        statKey: "recentlyPlayedCount",
        type: number,
    },
    averageReleaseDate: {
        category: "generalRelevance",
        displayName: "Average Release Date",
        description: "The average release date of songs in the playlist",
        statKey: "averageReleaseDate",
        type: dateTime,
    },
    avgSongPopularity: {
        category: "generalRelevance",
        displayName: "Average Song Popularity",
        description: "The average Spotify popularity score of songs in the playlist from 0 to 100",
        statKey: "avgSongPopularity",
        type: number,
    },
    artistDiversity: {
        category: "artistStats",
        displayName: "Artist Diversity",
        description: "Measures how diverse the playlist’s artists are on a scale from 0 to 100",
        statKey: "artistDiversity",
        type: number,
    },
    topArtistSongCount: {
        category: "artistStats",
        displayName: "Top Artist By Count",
        description: "The number of songs contributed by the playlist’s most common artist",
        statKey: "topArtistSongCount",
        type: artist + ", " + number,
    },
    topArtistPercentage: {
        category: "artistStats",
        displayName: "Top Artist By Percentage",
        description: "The percentage of the playlist made up by its most common artist",
        statKey: "topArtistPercentage",
        type: artist + ", " + percentage,
    },
    averageSongLength: {
        category: "songStats",
        displayName: "Average Song Length",
        description: "The average duration of songs in the playlist",
        statKey: "averageSongLength",
        type: time,
    },
    songDurationVariance: {
        category: "advancedSongStats",
        displayName: "Song Length Consistency",
        description: "Measures how similar song lengths are throughout the playlist",
        statKey: "songDurationVariance",
        type: number + ", " + squaredMinutes,
    },
    releaseDateVariance: {
        category: "advancedSongStats",
        displayName: "Release Date Consistency",
        description: "Measures how similar release dates are throughout the playlist",
        statKey: "releaseDateVariance",
        type: number + ", " + squaredDays,
    },
};

export const categoryDisplayNames = {
    maintenance: "Maintenance",
    userRelevance: "User Relevance",
    generalRelevance: "General Relevance",
    artistStats: "Artist Stats",
    songStats: "Song Stats",
};