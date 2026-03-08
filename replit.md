# Memento Mori

## Overview

Memento Mori is a "life in weeks" visualization app with two deployment targets:
1. **Web app** (todieisto.live) — React/Vite frontend + Express backend, serves as landing page
2. **Mobile app** (App Store) — React Native/Expo app in `mobile/` directory

First-time visitors see a splash page with a large skull & crossbones, "Memento Mori" title, and a birthdate picker. Returning visitors skip directly to the main visualization. Users enter their birthdate and a target age (60-100), and the app renders a two-column dot grid (12 dots/year for months) with progressive darkening for lived months and color-coded life events. Users can mark life events and see their current month (red border dot). The app's theme is stark black-and-white with red accents (#dc2626), inspired by the Stoic concept of remembering mortality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Web Frontend (client/)
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: React Query (`@tanstack/react-query`) for server state; React `useState` + `localStorage` for local persistence
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS
- **Animations**: Framer Motion
- **Date Calculations**: `date-fns`
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`
- **Key pages**: Home (main life grid view), FindPeace (wisdom quotes), SuggestQuote (quote suggestion form), NotFound (404)
- **Fonts**: Cinzel used site-wide — loaded via Google Fonts
- **Colors**: Lived = progressive darkening (black), events = color-coded, current = red border (#dc2626), remaining = gray

### Mobile App (mobile/)
- **Framework**: React Native with Expo SDK 52
- **Navigation**: React Navigation v6 (bottom tabs + native stack)
- **State**: AsyncStorage for persistence (birthdate, targetAge, events, favorites, seenMap)
- **Visualization**: react-native-svg for dot grid (two-column layout, 12 dots/year)
- **CSV Parsing**: Custom parser in `mobile/src/csv.ts`, loads `peace_archive.csv` via expo-asset + expo-file-system
- **Font**: Cinzel-Regular.ttf loaded via expo-font from `mobile/assets/fonts/`
- **Key screens**: HomeScreen (splash + grid + events), WisdomScreen (quotes), PhilosophyScreen, PrivacyScreen, TermsScreen, SuggestQuoteScreen
- **Key components**: LifeGrid (dot grid), DatePicker (custom dropdowns), EventForm, GravestoneBanner
- **Sharing**: React Native Share API for messages, expo-print for PDF export
- **Config**: `mobile/app.json` — bundleIdentifier: com.legiounius.mementomori
- **Metro config**: `mobile/metro.config.js` resolves from both mobile/ and root node_modules, includes CSV as asset extension
- **Assets**: skull_bg.jpg, skull_minimal.png in mobile/assets/images/, Cinzel-Regular.ttf in mobile/assets/fonts/, peace_archive.csv in mobile/assets/

### Backend (server/)
- **Framework**: Express 5 on Node.js, using TypeScript compiled via `tsx`
- **API Pattern**: Typed route definitions in `shared/routes.ts`
- **Current endpoints**:
  - `POST /api/users` — creates a user record with a birthdate
  - `POST /api/tracker/increment` — atomically increments the user counter
  - `GET /api/tracker/count` — returns the total count of users
- **Storage layer**: `server/storage.ts` uses `DatabaseStorage` class implementing `IStorage` interface

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect (`drizzle-orm/node-postgres`)
- **Connection**: `pg.Pool` using `DATABASE_URL` environment variable
- **Schema location**: `shared/schema.ts`
- **Current schema**: `users` table (id, birthdate, createdAt); `tracker` table (id, count)
- **Schema management**: `drizzle-kit push` via `npm run db:push`

### Build & Scripts
- `npm run dev` — Runs web dev server with Vite HMR via tsx (port 5000)
- `npm run build` — Builds client (Vite) and server (esbuild) to `dist/`
- `npm run start` — Runs production build from `dist/index.cjs`
- `npm run db:push` — Pushes Drizzle schema to PostgreSQL
- Expo Mobile workflow: `cd mobile && npx expo start --tunnel --port 8081`

## External Dependencies

- **PostgreSQL** — Primary database for web app
- **Google Fonts** — Cinzel, Inter, Space Mono fonts for web
- **Expo SDK 52** — Mobile app framework (packages installed at root level, resolved via metro.config.js)
- **React Navigation v6** — Mobile navigation
- **Replit plugins** (dev only) — vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner

## Contact
- **Email**: eric@legiounius.com
- **Domain**: todieisto.live
- **Bundle ID**: com.legiounius.mementomori
