const number = "number"
const percentage = "percentage"
const dateTime = "dateTime"
const artist = "artist"

export const statMap = {
    "Song Count": {
        "statKey": "songCount", "type": number, "group": "basicStats"
    },
    "% Songs >2 Years Old": {
        "statKey": "twoYearOldPercentage", "type": percentage, "group": "maintenanceStats"
    },
    "% Songs <6 Months Old": {
        "statKey": "sixMonthNewPercentage", "type": percentage, "group": "maintenanceStats"
    },
    "Last Song Added Date":  {
        "statKey": "lastSongAddedDate", "type": dateTime, "group": "maintenanceStats"
    },
    "Average Song Added Date":  {
        "statKey": "avgSongAddedDate", "type": dateTime, "group": "maintenanceStats"
    },
    "Average Song Release Date":  {
        "statKey": "avgSongReleaseDate", "type": dateTime, "group": "maintenanceStats"
    },
    "Most Frequent Artist By Count": {
        "statKey": "mostFrequentArtistByCount", "type": artist + ", " + number, "group": "artistStats"
    },
    "Most Frequent Artist By Percentage": {
        "statKey": "mostFrequentArtistByPercentage", "type": artist + ", " + percentage, "group": "artistStats"
    },
    "Average Song Duration":  {
        "statKey": "avgSongDuration", "type": number, "group": "advancedStats"
    },
    "Average Song Popularity Score": {
        "statKey": "avgSongPopularityScore", "type": number, "group": "advancedStats"
    },
    "% Songs in Top Short Term": {
        "statKey": "shortTermPercentage", "type": percentage, "group": "advancedStats"
    },
    "% Songs in Top Medium Term": {
        "statKey": "mediumTermPercentage", "type": percentage, "group": "advancedStats"
    },
    "% Songs in Top Long Term": {
        "statKey": "longTermPercentage", "type": percentage, "group": "advancedStats"
    },
     "% Songs in Saved Songs": {
        "statKey": "savedSongPercentage", "type": percentage, "group": "advancedStats"
    },
    "Artist Diversity Score": {
        "statKey": "artistDiversityScore", "type": number, "group": "advancedStats"
    }
};