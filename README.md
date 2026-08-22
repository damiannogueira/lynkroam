# Lynkroam

Lynkroam is a visual travel research workspace that helps travelers turn scattered travel links into organized trip decisions.

The product focuses on the research-to-decision stage of travel planning. It is designed to preserve source context and help travelers compare and organize options, rather than act as a generic bookmark manager or automatically generate an itinerary.

## Current application scope

This repository contains Lynkroam's deployed application foundation with:

- Routed trip-planning screens and placeholder product surfaces
- A shared root layout and global and trip-level navigation
- A responsive design system
- Server Components by default
- Fictional Barcelona sample data
- A server-rendered health check
- A trip-scoped Research Assistant with streamed AI chat
- Google Gemini integration through AI SDK
- A typed `fetchUrlMetadata` server-side tool
- Structured progress, success, and error states for metadata inspection
- Vercel production and Preview Deployments

Displayed trip content remains fictional and non-persistent. The current forms and planning surfaces demonstrate structure and visual direction only; chat conversation state is not persisted.

## Implemented routes

| Route | Purpose |
| --- | --- |
| `/` | Trips dashboard |
| `/trips/new` | Visual Create Trip form |
| `/trips/[tripId]` | Visual research workspace |
| `/trips/[tripId]/links` | Structured links and sources |
| `/trips/[tripId]/itinerary` | Curated itinerary view |
| `/trips/[tripId]/assistant` | Streaming travel research assistant and source metadata inspection |
| `/api/chat` | Streaming AI chat and typed tool endpoint |
| `/health` | Visual application health status |
| `/api/health` | JSON health endpoint |

The fictional Barcelona workspace can be reviewed manually at:

- `/trips/barcelona`
- `/trips/barcelona/links`
- `/trips/barcelona/itinerary`
- `/trips/barcelona/assistant`

## Technology

- Next.js 16.2.12 with the App Router and Turbopack
- React 19.2.4
- TypeScript
- Tailwind CSS 4
- ESLint 9
- AI SDK 7 with the Google provider and Gemini
- Zod 4
- npm
- Vercel

## Server Component policy

Pages and components remain Server Components by default. Client Components are introduced only when genuine browser-side interactivity requires them. The Research Assistant chat is a Client Component because it owns `useChat`, input state, streaming interaction, stopping, and conversation scrolling.

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
- `GOOGLE_GENERATIVE_AI_API_KEY` provides the server-side credential used by the Research Assistant's Gemini integration.
- Without an override or Vercel URL, the health utility falls back to `http://localhost:${PORT ?? 3000}`.
- Vercel supplies `VERCEL_URL` and `VERCEL_ENV`.
- No secret values belong in the repository.

Protected Vercel Preview Deployments use the server-only system variable `VERCEL_AUTOMATION_BYPASS_SECRET`. Its sole purpose here is to authorize the internal health request through deployment protection.

## Research Assistant tool contract

The Research Assistant includes actionable click-to-fill prompts for first-run guidance and a response-shaped pending state before visible content arrives. If a chat response is interrupted, partial streamed content remains visible and `Retry response` retries the failed assistant response without resending the user's message. A route-scoped recovery boundary handles unexpected display failures, while metadata results distinguish normal success, successful results with no descriptive content, and tool execution failures.

### `fetchUrlMetadata`

`fetchUrlMetadata` inspects page-level metadata from a user-supplied public HTTP or HTTPS webpage. It is an on-demand metadata tool, not unrestricted web browsing or verification of every fact on a page.

Input:

```ts
{
  url: string;
}
```

`url` must be a complete public HTTP or HTTPS webpage URL.

Structured return value:

```ts
{
  url: string;
  hostname: string;
  title: string | null;
  description: string | null;
  siteName: string | null;
}
```

The final URL and hostname are always returned on success. Optional page metadata is `null` when unavailable rather than inferred.

The tool can fail for invalid or unsupported URLs, blocked local or private-network destinations, HTTP errors, non-HTML responses, timeouts, oversized responses, or excessive redirects. A failed execution appears as a designed error state inside the conversation instead of crashing the chat.

Its typed UI part renders four lifecycle states: `input-streaming`, `input-available`, `output-available`, and `output-error`. Successful structured output is presented as a source metadata card rather than raw JSON.

## Health check

`/api/health` returns only the application name, status, environment, and a fresh timestamp. `/health` performs an actual server-side fetch to that endpoint and presents the result visually.

Both the API response and server fetch disable caching. The endpoint exposes no sensitive data. For protected Preview Deployments, the protection-bypass header is added only when the Vercel system variable exists; local requests work without it. The health check has been verified both locally and in a protected Preview Deployment.

## Deployment workflow

`main` is the Vercel Production Branch. Feature and assignment branches can be reviewed through Vercel Preview Deployments before merging.

Production is available at [https://lynkroam.vercel.app](https://lynkroam.vercel.app).

Changes should pass local verification and be reviewed in a Preview Deployment before they are merged into `main`.

## Accessibility and responsive targets

The application foundation includes:

- Semantic landmarks and a clear heading hierarchy
- Keyboard-accessible navigation
- A skip link
- Visible focus states
- Explicit form labels
- States communicated with text rather than color alone

The intended responsive review widths are 375px and 1280px.

## Motion and state micro-interactions

The live `/motion` demo uses approximately 150ms ease-out hover/focus feedback, a 100ms ease-out active press, and 200ms ease-out lifecycle-content and state color/shadow transitions. Its deterministic action delay is 900ms; success remains visible for 1200ms, while error remains for 1500ms because recovery feedback benefits from slightly more reading time. Fast direct-input feedback feels immediate, while the slightly slower lifecycle changes remain perceptible without feeling sluggish; transform and opacity provide the primary motion without animating width, height, or other layout properties, and `prefers-reduced-motion` removes movement while preserving loading, success, error, and focus feedback.

## Explicit current non-goals

The current application does not implement:

- Authentication
- Persistence or database workflows
- Real trip creation
- Persistent URL-ingestion or automatic source-library workflows
- Full-page extraction or verification of changing webpage facts
- Drag-and-drop
- Filtering and sorting
- Maps
- AI itinerary generation
- Collaboration
- Billing
- Admin tools

## Future direction

The following ideas are not currently implemented. Lynkroam may later support:

- Persisting inspected travel sources into an automatic ingestion workflow
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

The production build must expose the application's implemented routes, including the Research Assistant and health endpoints. Repository review must also confirm that no secrets or generated artifacts are tracked.
