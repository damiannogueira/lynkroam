# Lynkroam

Lynkroam is a visual travel research workspace that helps travelers turn scattered travel links into organized trip decisions.

The product focuses on the research-to-decision stage of travel planning. It is designed to preserve source context and help travelers compare and organize options, rather than act as a generic bookmark manager or automatically generate an itinerary.

## Current FE-04 scope

This repository currently contains a deployed application skeleton with:

- Routed placeholder screens for the approved product surfaces
- A shared root layout and global and trip-level navigation
- A responsive design system
- Server Components by default
- Fictional Barcelona sample data
- A server-rendered health check
- Vercel production and Preview Deployments

All displayed trip content is fictional and non-persistent. The current forms and planning surfaces demonstrate structure and visual direction only.

## Implemented routes

| Route | Purpose |
| --- | --- |
| `/` | Trips dashboard |
| `/trips/new` | Visual Create Trip form |
| `/trips/[tripId]` | Visual research workspace |
| `/trips/[tripId]/links` | Structured links and sources |
| `/trips/[tripId]/itinerary` | Curated itinerary view |
| `/health` | Visual application health status |
| `/api/health` | JSON health endpoint |

The fictional Barcelona workspace can be reviewed manually at:

- `/trips/barcelona`
- `/trips/barcelona/links`
- `/trips/barcelona/itinerary`

## Technology

- Next.js 16.2.12 with the App Router and Turbopack
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- ESLint 9
- npm
- Vercel

## Server Component policy

Pages and components are Server Components by default. No Client Component is currently required. The `"use client"` directive should be introduced only when a feature requires genuine browser-side interactivity.

The root layout owns the shared `<main>` landmark, so individual pages render their content without adding another main landmark.

## Local development

Install the locked dependencies and start the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other project commands:

```bash
npm run lint
npm run build
npm run start
```

`npm run start` serves the production build created by `npm run build`.

## Environment variables

Real `.env*` files remain ignored. The committed `.env.example` documents the optional environment structure without containing secrets.

- `HEALTHCHECK_ORIGIN` optionally overrides the application origin outside Vercel.
- Without an override or Vercel URL, the health utility falls back to `http://localhost:${PORT ?? 3000}`.
- Vercel supplies `VERCEL_URL` and `VERCEL_ENV`.
- No secret values belong in the repository.

Protected Vercel Preview Deployments use the server-only system variable `VERCEL_AUTOMATION_BYPASS_SECRET`. Its sole purpose here is to authorize the internal health request through deployment protection.

## Health check

`/api/health` returns only the application name, status, environment, and a fresh timestamp. `/health` performs an actual server-side fetch to that endpoint and presents the result visually.

Both the API response and server fetch disable caching. The endpoint exposes no sensitive data. For protected Preview Deployments, the protection-bypass header is added only when the Vercel system variable exists; local requests work without it. The health check has been verified both locally and in a protected Preview Deployment.

## Deployment workflow

`main` is the Vercel Production Branch. Pushes to `fe-04/capstone-skeleton` generate Preview Deployments for review.

Production is available at [https://lynkroam.vercel.app](https://lynkroam.vercel.app).

Changes should pass local verification and be reviewed in a Preview Deployment before they are merged into `main`.

## Accessibility and responsive targets

The FE-04 foundation includes:

- Semantic landmarks and a clear heading hierarchy
- Keyboard-accessible navigation
- A skip link
- Visible focus states
- Explicit form labels
- States communicated with text rather than color alone

The intended responsive review widths are 375px and 1280px.

## Explicit current non-goals

FE-04 does not implement:

- Authentication
- Persistence or database workflows
- Real trip creation
- URL ingestion or metadata extraction
- Drag-and-drop
- Filtering and sorting
- Maps
- AI itinerary generation
- Collaboration
- Billing
- Admin tools

## Future direction

The following ideas are outside FE-04 and are not currently implemented. Lynkroam may later support:

- Pasting travel links and extracting useful source metadata
- Organizing large trips hierarchically by continent, country, and city
- Automatic location classification with manual correction
- Views by location, category, decision state, and itinerary chronology
- Multilingual interface support
- Preserving original source languages
- Optional translations and summaries in the user's selected language

## Verification

Run:

```bash
npm run lint
npm run build
```

The production build must expose every required FE-04 route. Repository review must also confirm that no secrets or generated artifacts are tracked.
