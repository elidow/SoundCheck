# MySPStats
Makes API requests to the Spotify Web API to retrieve playlist information and provide insights on playlist usage for streamlined Spotify updates

# What problem are you trying to solve?
- I really enjoy making Spotify playlists. Since 2019, I have made a lot for specific genres, decades, events, and vibes. There are some for just myself, and others for small or big groups
- Unfortunately, now that I have 50+ playlists and 40+ public playlists, it is very difficult to maintain them and keep them fresh
- I do a decent job at adding new songs to my most listened to playlists, but there are several that I have not updated in 2+ years (when I last did a mass update)
- That means there are a lot of playlists I don’t listen to because they have old songs and my music taste changes over time, or it is hard to remember what is on it
- In the past, I have gone through each one by one, but I don’t have as much time or patience to do this all at once. I would rather stagger out the updates by what is in most need of an update

# What is your ideal general solution as a user?
- Essentially, I want a way to keep track of all of the necessary information or statistics regarding my Spotify playlists so that I can more easily maintain and modify them (add songs, remove songs) to keep them fresh
- At minimum, it would extremely helpful to have some sort of simple yet visually pleasing UI to display this information in one place, and separate it by different categories
- The most important data I want to keep track of per playlist is:
  - how many songs are there
  - how many/percentage of songs are old (> 2 years), how many are new (< 6 months)
  - last time a song was added/last time 10 songs were added?
  - how many artists do I have/which artist has the most songs?
- Everytime I see this data, I would like the information to be configurable and accurate (real-time)
- Has to be free. There is no point if I have to spend money (other than my spotify membership of course)
- Nice to have: Get users top played items (artists, songs) to analyze which playlists have played songs
- Nice to have: Get notified once (email/text) when a playlist’s statistic reaches a certain benchmark (Example: 50% of songs are 2+ years old, last song added was 1+ year)
- Nice to have: Get song data about music and use data science/ML to find recommened songs. Spotify already does this, but I think Spotify AI could be better based on preferences

# POC
Python code to prove that Spotify Web API can be used to retrieve playlist data and use that data to get insightful data

# Project
React/Javascript based web application to login into spotify and retrieve playlist data to show insights

# Dependencies
Spotify Web API

# What is Implemented?
- Python POC
- React App Setup/Basic Structure
- Github Setup
- Authentication & Token Setup (Implicit grant -- not recommended)
- Basic Playlist Data Retrieval
- Basic Playlist Song Data Retrieval
- Basic Statistics Calculation Functions: 
-   Number of songs, % of 2 years old, % of 6 months young
- Navigation Bar for Dashboard and Table Page
- Context Provider Architecture for only one API call
- Authentication & Token Setup (Authorization with PKCE)
- Graphics for each dashboard row
- Basic Table View with dynamic table of all data

# What is Coming Soon? (Next 4 Weeks)
- Dashboard Components Structure
-> Customizable
-> Graphics Colors (Colors)
-> Advanced Design
- Table Page
-> Advanced Design
- Playlist Page
-> Can see playlists and songs
-> Can see where it needs the most updates
- More Statistics
-> Time from last added the last 10 songs
-> Artist distribution
-> % of most played songs in last 4 weeks/6 months/1 year
-> Grouping of Stats on Dashboard Page
- Hosting
-> Security
-> Login
- Testing