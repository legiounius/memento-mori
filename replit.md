# Memento Mori

## Overview

Memento Mori is a "life in weeks" visualization app. Users enter their birthdate and a target age, and the app renders a grid showing every week of their expected life — weeks lived are filled in, future weeks are empty. Users can also mark life events on the grid. The app's theme is stark black-and-white, inspired by the Stoic concept of remembering mortality.

The project follows a full-stack TypeScript architecture with a React frontend (Vite) and Express backend, using PostgreSQL via Drizzle ORM. Most of the app logic is client-side — the grid calculations and event management use localStorage. The backend primarily exists for optional user persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled by Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: React Query (`@tanstack/react-query`) for server state; React `useState` + `localStorage` for local persistence of birthdate, target age, and life events
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives, styled with Tailwind CSS and CSS variables for theming
- **Animations**: Framer Motion
- **Date Calculations**: `date-fns` (specifically `differenceInWeeks`)
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`, `@assets/` maps to `attached_assets/`
- **Key pages**: Home (main life grid view), NotFound (404)
- **Key components**: `LifeGrid` (the week grid visualization), `DatePicker` (custom month/day/year dropdowns), `EventForm` (add life events)
- **Fonts**: Cinzel (display), Inter (body), Space Mono (monospace) — loaded via Google Fonts with CSS custom properties (`--font-display`, `--font-body`, `--font-mono`)

### Backend
- **Framework**: Express 5 on Node.js, using TypeScript compiled via `tsx`
- **API Pattern**: Typed route definitions in `shared/routes.ts` — input/output schemas defined with Zod, shared between client and server
- **Current endpoints**: `POST /api/users` — creates a user record with a birthdate
- **Storage layer**: `server/storage.ts` uses a `DatabaseStorage` class implementing `IStorage` interface (dependency inversion pattern)
- **Dev server**: Vite dev middleware served through Express with HMR support
- **Production build**: Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.cjs`

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect (`drizzle-orm/node-postgres`)
- **Connection**: `pg.Pool` using `DATABASE_URL` environment variable
- **Schema location**: `shared/schema.ts`
- **Current schema**: Single `users` table with `id` (serial PK), `birthdate` (timestamp, required), `createdAt` (timestamp, auto-set)
- **Schema management**: `drizzle-kit push` via `npm run db:push`; migrations output to `./migrations`
- **Validation**: `drizzle-zod` generates Zod schemas from Drizzle table definitions

### Shared Code
- `shared/schema.ts` — Database schema and Zod validation types, shared between client and server
- `shared/routes.ts` — API route definitions with method, path, input schema, and response schemas. Acts as a typed contract.

### Build & Scripts
- `npm run dev` — Runs dev server with Vite HMR via tsx
- `npm run build` — Builds client (Vite) and server (esbuild) to `dist/`
- `npm run start` — Runs production build from `dist/index.cjs`
- `npm run db:push` — Pushes Drizzle schema to PostgreSQL
- `npm run check` — TypeScript type checking

## External Dependencies

- **PostgreSQL** — Primary database, connected via `DATABASE_URL` environment variable. Required for the app to start.
- **Google Fonts** — Cinzel, Inter, Space Mono fonts loaded from `fonts.googleapis.com`
- **Replit plugins** (dev only) — `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`, `@replit/vite-plugin-dev-banner` for development experience on Replit