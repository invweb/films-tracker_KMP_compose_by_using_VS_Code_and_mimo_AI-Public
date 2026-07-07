# Films — Movie Tracker & Planner

A web app for tracking movies you want to watch, with recommendations, ratings, and premiere calendar.

![Search](screenshots/search.png)
![Movie Detail](screenshots/movie-detail.png)
![Premieres](screenshots/calendar.png)

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + SQLite (sql.js)
- **Movie Data**: OMDb API (Open Movie Database)

## Features

- Search movies via OMDb
- Trending movies
- Three lists: Watchlist, Watched, Favorites
- Ratings (1–10), notes, tags
- Upcoming premieres calendar (including Blade 2025)
- Movie recommendations based on watch history
- Export lists to CSV
- Detailed movie pages (description, cast, similar movies)
- Dark theme UI

## Quick Start

### Backend

```bash
cd server
npm install
cp .env.example .env   # add your OMDb API key
npm run dev
```

Server runs at `http://localhost:3001`

### Web Client

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`

## OMDb API Key

1. Go to http://www.omdbapi.com/apikey.aspx
2. Select **FREE** and enter your email
3. Receive key via email
4. Add to `server/.env` → `OMDB_API_KEY`

> Without a key, the app runs in demo mode with built-in sample movies.

## Project Structure

```
Films/
├── server/          # Express API + SQLite
├── web/             # React + Vite web client
├── mobile/          # React Native + Expo (mobile app)
├── screenshots/     # App screenshots
└── README.md
```

## License

MIT
