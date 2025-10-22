# SoundCheck
SoundCheck is a solution to provide advanced insights on your Spotify playlists for streamlined maintenacnce. The web app makes requests to the Spotify Web API to retrieve relevant playlist and user data. From there it retrieves or calculates statistics in a variety of categories and scores those statistics if applicable. This information is shown through a few features: playlist overview, playlist specifics, customizable dashboards, and tables.

# What problem are you trying to solve?
- I really enjoy making Spotify playlists. Since 2019, I have made a lot for specific genres, decades, events, and vibes. There are some for just myself, and others for small or big groups
- Unfortunately, now that I have 50+ playlists and 40+ public playlists, it is very difficult to maintain them and keep them fresh
- I do a decent job at adding new songs to my most listened to playlists, but there are several that I have not updated in 2+ years (when I last did a mass update)
- That means there are a lot of playlists I don’t listen to because they have old songs and my music taste changes over time, or it is hard to remember what is on it
- In the past, I have gone through each one by one, but I don’t have as much time or patience to do this all at once. I would rather stagger out the updates by what is in most need of an update.

# What is your solution to this problem?
- Essentially, I want a way to keep track of all of the necessary information or statistics regarding my Spotify playlists so that I can more easily maintain and modify them (add songs, remove songs) to keep them fresh
- At minimum, it would extremely helpful to have some sort of simple yet visually pleasing UI to display this information in one place, and separate it by different categories
- The most important data I want to keep track of per playlist is:
  - how many songs are there
  - how many/percentage of songs are old (> 2 years), how many are new (< 6 months)
  - last time a song was added
  - how many artists do I have/which artist has the most songs?
- Other data that would be helpful
  - Average release date, average popularity
  - % of songs from my most played lists (short-term, medium-term, long-term)
  - % of songs from my saved songs
  - Artist distribution
  - Advanced song variance: bpm, energy, dance, duration
- Everytime I see this data, I would like the information to be configurable and accurate (real-time)
- Has to be free. There is no point if I have to spend money (other than my spotify membership of course)
- Nice to have: Get song data about music and use data science/ML to find recommened songs. Spotify already does this, but I think Spotify AI could be better based on preferences.

# Plans to expand?
I am pretty aware of its strengths and weaknesses. People who love putting in the work to make their playlist or love advanced stats would love this. Others, not so much. Could expand this to everyone,
so you never know.

# POCs
sound-check-pocs contains Python code that either provides a POC for SoundCheck using the SpotifyWebApi or is used to general information or insightful data to me.

# Project
React/Javascript based web application to login into spotify and retrieve playlist data to show insights

# Dependencies
Spotify Web API

# What is Implemented?
2025 Q1
- Python POC
- React App Setup/Basic Structure
- Github Setup
- Authentication & Token Setup (Implicit grant -- not recommended)
- Basic Playlist Data Retrieval
- Basic Playlist Song Data Retrieval
- Basic Statistics Calculation Functions: 
-> Number of songs, % of 2 years old, % of 6 months young, last song added

2025 Q2
- Navigation Bar for Dashboard and Table Page
- Context Provider Architecture for only one API call
- Authentication & Token Setup (Authorization with PKCE)
- More Stats: 
-> Avg Song Added, Last Song Added, Release Date Average, most popular artist, Popularity, avg song length
- Dashboards Page: Dashboard has #, playlist name, stat, graphics
- Dashboard with buttons
- Basic Table View with dynamic table of all data
- Import Graphics Library

2025 Q3
- More Stats:
-> % of songs short term/medium term/long term, saved songs, recently played, 
- Stat Calculation Refactor
- Score Calculations
- Playlist Page with all playlists listed by scores
- Playlist Songs Page with all songs and stats/scores
- Dashboard graphics fixed
- Tables in groups

# What is Coming Soon? (Next Quarter)
- Page Layout Consistency
- Header Consistency
- Footer Consistency
- Update Name to Sound Check
- Fix Grid Layout
- Nav Bar Spread Out
- Refactor Score Functions
- Common Mapping Functionality

- Variance Stats/Scores, fix Artist
- Saved Song Accuracy
- Playlist Name links to page/shows
- Playlist Page Fix Rank
- Add Ranks
- Add Ranks to UI
- Common Table Functionality

- Major Styling Update to Stats/Scores
- Major Styling Update for Song Table
- Playlist Page Add symbols for top/bottom by rank

- Table Collapse Functionality
- Make list of all playlist Songs 
- Settings/User Page Start
- Settings/User Page End