# Films — Movie Tracker & Planner

A cross-platform movie tracking app with recommendations, ratings, premiere calendar, and social features. Built with **Kotlin Multiplatform (KMP)** + **Compose Multiplatform**, **React**, and a Node.js backend.

## Screenshots

### Desktop (KMP)
![Desktop Search](screenshots/desktop-search.png)

### Web (React)
![Search](screenshots/search.png)
![Movie Detail](screenshots/movie-detail.png)
![Premieres](screenshots/calendar.png)
![Recommendations](screenshots/recommendations.png)

### Android (KMP)
| Search | Movie Detail |
|--------|-------------|
| ![Android Search](screenshots/android-search.png) | ![Android Detail](screenshots/android-detail.png) |

## Features

### Core
- **Search** movies (local database + TMDB API)
- **Trending** — top-rated films sorted by IMDB rating
- **Three lists** — Watchlist, Watched, Favorites
- **Ratings** (1–10), notes, tags
- **Sorting** — by date, rating, or title
- **Upcoming premieres** — calendar with release dates
- **Recommendations** — based on your watch history and genre preferences
- **Export** lists to CSV
- **Detailed movie pages** — description, cast, similar movies, genres

### Social
- **Reviews** — write and read reviews from other users
- **Community ratings** — see average ratings from all users
- **User profiles** — each user has their own data

### Personalization
- **Dark/Light theme** — toggle between themes
- **Multi-language** — English and Russian (i18n)
- **Statistics** — detailed analytics with charts

### Technical
- **Authentication** — register/login with JWT
- **Real-time sync** — WebSocket-based data synchronization
- **Push notifications** — get alerts about upcoming premieres
- **Accessibility** — ARIA labels, keyboard navigation, screen reader support
- **PWA** — installable, offline support
- **Animations** — page transitions, hover effects
- **React Query** — cached API requests, optimistic updates

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Web)** | React 18 + TypeScript + Vite |
| **Frontend (KMP)** | Kotlin Multiplatform + Compose Multiplatform |
| **Backend** | Node.js + Express + SQLite (sql.js) |
| **Movie Data** | Local database + TMDB API |
| **State Management** | TanStack React Query |
| **Animations** | Framer Motion |
| **i18n** | i18next + react-i18next |
| **Auth** | JWT + bcrypt |
| **Real-time** | WebSocket |
| **Push** | Web Push API |
| **Testing** | Vitest + Testing Library |
| **CI/CD** | GitHub Actions |
| **Desktop** | Compose Desktop (JVM) |
| **Web (WasmJS)** | Compose for Web |
| **Android** | Compose for Android |

## Quick Start

### Prerequisites
- Node.js 20+
- JDK 17+ (for KMP)
- Android SDK (for Android app)

### 1. Backend

```bash
cd server
npm install
npm run dev
```

Server runs at `http://localhost:3001`
WebSocket available at `ws://localhost:3001/ws`

### 2. Web Client (React)

```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173`

### 3. Desktop App (KMP)

```bash
cd films-app
export JAVA_HOME=/opt/homebrew/opt/openjdk@17  # or your JDK 17+ path
./gradlew :desktop:run
```

### 4. Android App

```bash
cd films-app
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export ANDROID_HOME=~/Library/Android/sdk
./gradlew :android:installDebug   # installs on connected device/emulator
```

### 5. Run Tests

```bash
cd web
npm test
```

> The app works out of the box with a built-in local movie database and TMDB API for fresh poster images.

## Project Structure

### KMP (films-app/)
```
films-app/
├── shared/                      # Shared business logic (Kotlin Multiplatform)
│   └── src/commonMain/kotlin/com/films/shared/
│       ├── api/FilmsApi.kt      # HTTP client (Ktor)
│       ├── model/Models.kt      # Movie, UserMovie, Stats
│       └── ui/                  # Compose screens (shared across all platforms)
├── desktop/                     # Desktop app (JVM)
├── web/                         # Web app (WasmJS)
├── android/                     # Android app
└── build.gradle.kts
```

### Web (web/)
```
web/
├── src/
│   ├── main.tsx                 # Entry point + providers
│   ├── App.tsx                  # Router + lazy loading + sync
│   ├── i18n.ts                  # Internationalization setup
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── hooks/
│   │   └── useSync.ts           # Real-time sync hook
│   ├── pages/
│   │   ├── SearchPage.tsx       # Search + trending
│   │   ├── ListsPage.tsx        # Watchlist/Watched/Favorites
│   │   ├── CalendarPage.tsx     # Upcoming premieres
│   │   ├── RecsPage.tsx         # Recommendations
│   │   ├── MoviePage.tsx        # Movie detail + reviews
│   │   ├── StatsPage.tsx        # Statistics dashboard
│   │   └── AuthPage.tsx         # Login/Register
│   ├── components/
│   │   ├── SyncStatus.tsx       # Sync indicator
│   │   └── NotificationSettings.tsx
│   ├── services/
│   │   ├── api.ts               # API client
│   │   ├── sync.ts              # WebSocket sync service
│   │   └── notifications.ts     # Push notification service
│   ├── locales/
│   │   ├── en.json              # English translations
│   │   └── ru.json              # Russian translations
│   └── __tests__/               # Unit tests
├── public/
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service worker
├── vite.config.ts               # Vite config + code splitting
└── package.json
```

### Backend (server/)
```
server/
├── src/
│   ├── db.ts                    # SQLite database (sql.js)
│   ├── db-helper.ts             # Database helper functions
│   ├── websocket.ts             # WebSocket server
│   ├── premiere-checker.ts      # Push notification scheduler
│   ├── local-movies.ts          # Movie database
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts              # Login/Register endpoints
│   │   ├── movies.ts            # User lists CRUD + stats
│   │   ├── tmdb.ts              # Movie search + recommendations
│   │   ├── reviews.ts           # Reviews CRUD
│   │   ├── sync.ts              # Data synchronization
│   │   └── notifications.ts     # Push notifications
│   └── index.ts                 # Express + WebSocket server
├── .env                         # Configuration
└── .env.example
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user

### Movies
- `GET /api/movies` — Get user's movies
- `POST /api/movies` — Add movie to list
- `DELETE /api/movies/:tmdbId/:listType` — Remove movie
- `GET /api/movies/stats` — Get basic stats
- `GET /api/movies/stats/detailed` — Get detailed statistics
- `GET /api/movies/export` — Export to CSV

### TMDB
- `GET /api/tmdb/search` — Search movies
- `GET /api/tmdb/trending` — Get trending movies
- `GET /api/tmdb/upcoming` — Get upcoming premieres
- `GET /api/tmdb/movie/:id` — Get movie details
- `GET /api/tmdb/recommendations` — Get recommendations

### Reviews
- `GET /api/reviews/movie/:tmdbId` — Get movie reviews
- `GET /api/reviews/my/:tmdbId` — Get my review
- `POST /api/reviews` — Create/update review
- `DELETE /api/reviews/:tmdbId` — Delete review

### Sync
- `GET /api/sync` — Get synced data
- `POST /api/sync` — Push changes

### Notifications
- `GET /api/notifications/vapid-key` — Get VAPID key
- `POST /api/notifications/subscribe` — Subscribe to push
- `POST /api/notifications/unsubscribe` — Unsubscribe
- `GET /api/notifications/status` — Get subscription status

## Environment Variables

### server/.env
```
PORT=3001
OMDB_API_KEY=your_omdb_api_key
JWT_SECRET=your_jwt_secret
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

## License

MIT
