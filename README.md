# Films — Movie Tracker & Planner

A cross-platform movie tracking app with recommendations, ratings, and premiere calendar. Built with **Kotlin Multiplatform (KMP)** + **Compose Multiplatform** and a Node.js backend.

![Search](screenshots/search.png)
![Movie Detail](screenshots/movie-detail.png)
![Premieres](screenshots/calendar.png)

## Features

- **Search** 50+ classic and trending movies (fully local database)
- **Trending** — top-rated films sorted by IMDB rating
- **Three lists** — Watchlist, Watched, Favorites
- **Ratings** (1–10), notes, tags
- **Upcoming premieres** — Blade (2025), Mission Impossible 8, Deadpool & Wolverine, Dune: Part Two
- **Recommendations** — based on your watch history and genre preferences
- **Export** lists to CSV
- **Detailed movie pages** — description, cast, similar movies, genres
- **Dark theme** UI
- **Cross-platform** — Desktop (JVM), Web (WasmJS), Android

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Kotlin Multiplatform + Compose Multiplatform |
| **Backend** | Node.js + Express + SQLite (sql.js) |
| **Movie Data** | Local database (48 films) + optional OMDb API |
| **Desktop** | Compose Desktop (JVM) |
| **Web** | Compose for Web (WasmJS) |
| **Android** | Compose for Android |

## Quick Start

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:3001`

### 2. Desktop App (KMP)

```bash
cd films-app
export JAVA_HOME=/opt/homebrew/opt/openjdk@17  # or your JDK 17+ path
./gradlew :desktop:run
```

### 3. Web Client (React — alternative)

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`

> The app works out of the box with a built-in local movie database. No API key required for basic functionality.

## KMP Project Structure

```
films-app/
├── shared/                      # Shared business logic (Kotlin Multiplatform)
│   └── src/commonMain/kotlin/com/films/shared/
│       ├── api/FilmsApi.kt      # HTTP client (Ktor)
│       ├── model/Models.kt      # Movie, UserMovie, Stats
│       └── ui/                  # Compose screens (shared across all platforms)
│           ├── SearchScreen.kt
│           ├── ListsScreen.kt
│           ├── CalendarScreen.kt
│           ├── RecommendationsScreen.kt
│           └── MovieDetailScreen.kt
├── desktop/                     # Desktop app (JVM) ✅
│   └── src/desktopMain/
├── web/                         # Web app (WasmJS)
│   └── src/wasmJsMain/
├── android/                     # Android app
│   └── src/main/
├── build.gradle.kts             # Root build file
├── settings.gradle.kts
└── gradlew
```

## Backend Structure

```
server/
├── src/
│   ├── db.ts                    # SQLite database (sql.js)
│   ├── local-movies.ts          # 48 curated films with full metadata
│   ├── routes/
│   │   ├── movies.ts            # User lists CRUD + export CSV
│   │   └── tmdb.ts              # Movie search, trending, recommendations
│   └── index.ts                 # Express entry point
└── .env.example
```

## Optional: OMDb API Key

For extended search (access to 500K+ movies), you can add an OMDb API key:

1. Go to **http://www.omdbapi.com/apikey.aspx**
2. Select **FREE** and enter your email
3. Receive key via email
4. Add to `server/.env`:
   ```
   OMDB_API_KEY=your_key_here
   ```
5. Restart the server

> Without the key, the app uses the local database of 48 curated films — search, trending, recommendations, and premieres all work offline.

## License

MIT
