# PRODUCT SPEC

## Product Name
Lynkroam

## One-Sentence Positioning
Lynkroam is a visual travel research workspace that helps travelers turn scattered travel links into organized trip decisions.

## Product Vision
Lynkroam helps travelers move from inspiration and information overload to clear, confident trip planning by making travel research visually structured, source-aware, and easy to compare.

## Problem Statement
Travel planning often happens across many disconnected sources: airline pages, hotel listings, Airbnb or Booking pages, maps, blogs, videos, social posts, restaurant recommendations, tours, and transportation options. A traveler may save many links, but the process of comparing options, deciding what matters, and organizing a trip remains fragmented and inefficient.

Existing tools are often either overly general bookmark managers or purely itinerary generators. Lynkroam fills the gap between discovery and final trip planning by preserving each source as context while helping the traveler evaluate, classify, and organize travel choices.

## Primary Target User
The primary target user is an independent traveler planning a complex trip who collects information from many online sources and wants a structured place to compare options before finalizing a plan.

## Main User Scenario
A traveler is planning a trip and collects links from multiple sources while researching flights, accommodation, restaurants, activities, and transport. They want to save those links in one place, preserve the original context of each source, classify and compare their options, decide what to keep or reject, and later move selected choices into an itinerary.

## Product Differentiation
Lynkroam is differentiated by three core qualities:

- It is built around the research-to-decision phase of travel planning, not just bookmarking or itinerary generation.
- It preserves the original source context for each travel resource, so users can revisit the reason a decision was made.
- It organizes travel research visually, allowing users to compare options and move decisions through a clear planning workflow.

## Core User Journey
1. Create a trip.
2. Paste or add public travel URLs.
3. Convert each URL into a visual card with source context.
4. Classify the card into a travel category.
5. Add notes, price estimates, location, and decision status.
6. Organize and compare cards visually.
7. Move cards through planning states such as Inbox, Considering, Shortlisted, Booked, and Rejected.
8. Select approved options and move them into an itinerary.

## Information Architecture
Lynkroam is organized around the concept of a trip as the primary container for travel research.

Core information structure:
- Trip
  - Represents a single travel plan or planning project.
  - Contains research cards, notes, and itinerary content.
- Research Card
  - Represents a saved travel resource or option.
  - Includes source link, title, category, notes, estimated price, location, and decision status.
- Source
  - Represents the original public URL and its contextual origin.
  - Preserved so the user can return to the original reference.
- Decision State
  - Represents where a research card sits in the planning workflow.
- Itinerary
  - Represents the final selected set of options that the user wants to carry forward.

## Complete Route Inventory
The FE-04 product specification includes the following routes:

1. /
   Trips Dashboard

2. /trips/new
   Create Trip

3. /trips/[tripId]
   Visual Research Workspace

4. /trips/[tripId]/links
   Structured Links and Sources View

5. /trips/[tripId]/itinerary
   Trip Itinerary

6. /health
   Application Health Check

## Purpose and Placeholder Content for Every Routed Screen

### 1. /
Purpose: Serve as the landing surface for the user’s trips and planning activity.

Placeholder content:
- A heading for “Trips”
- A summary list of existing trips
- A clear call to action to create a new trip
- A simple empty or sample state for users with no trips yet

### 2. /trips/new
Purpose: Allow the user to begin planning a new trip.

Placeholder content:
- A heading for “Create Trip”
- A visual form structure with labeled fields for trip name, destination, and trip dates or planning context
- A submit action placeholder
- A short explanatory message that the form is a FE-04 skeleton and does not create or persist a trip during this phase
- The placeholder should be implementable without requiring client-side state or a Client Component merely to satisfy the skeleton assignment

### 3. /trips/[tripId]
Purpose: Act as the primary visual workspace for researching and organizing travel decisions.

Placeholder content:
- A trip header with name and context
- A section for cards or research items
- A simple board or list layout showing planning states
- Empty or sample placeholders indicating where cards will appear
- A clear entry point to view links and itinerary
- For FE-04 verification, this route should be manually viewable using a sample trip ID such as “barcelona” at /trips/barcelona

### 4. /trips/[tripId]/links
Purpose: Provide a structured view of saved links and their source context.

Placeholder content:
- A heading for “Links and Sources”
- A list or grouped view of research cards
- Placeholder items representing links that can be grouped by category or status
- A clear indication that this screen is for structured sources rather than generic bookmarks
- For FE-04 verification, this route should be manually viewable using the sample trip ID “barcelona” at /trips/barcelona/links

### 5. /trips/[tripId]/itinerary
Purpose: Show the selected travel decisions that the user wants to carry into a planned itinerary.

Placeholder content:
- A heading for “Trip Itinerary”
- A simple collection of selected items
- Placeholder sections for flights, accommodation, activities, food, and transport
- Guidance that this is the curated outcome of the research workspace
- For FE-04 verification, this route should be manually viewable using the sample trip ID “barcelona” at /trips/barcelona/itinerary

### 6. /health
Purpose: Provide a simple health-check view for the application.

Placeholder content:
- A heading for “Application Health”
- A status indicator or summary showing the app is running
- The page must render data obtained through fetch, and the fetched result must include at least application name, status, environment, and timestamp
- A static placeholder alone does not satisfy the requirement
- The page must be implemented as a Server Component and must remain a Server Component unless a future interactive requirement provides a concrete reason for a Client Component
- The exact API or implementation approach is not prescribed in this specification

## Global and Trip-Level Navigation
### Global Navigation
The global navigation should expose:
- Trips
- New Trip
- Health

### Trip-Level Navigation
Inside a trip, the secondary navigation should expose:
- Workspace
- Links
- Itinerary

Navigation behavior:
- The trip-level navigation appears when viewing a specific trip route.
- The workspace route is the default trip experience.
- Links and itinerary are secondary views within the same trip context.

## Responsive Expectations
### Mobile / Small Viewport: 375 px
The experience should be usable and readable on a narrow screen. Layouts should stack vertically, navigation should remain accessible, and primary actions should be easy to reach with one hand.

### Desktop / Large Viewport: 1280 px
The experience should make efficient use of wider screens with more spacious content regions, clearer separation of primary workspace areas, and room for visual comparison and multi-column content.

## Accessibility Expectations
The product should follow accessible interaction patterns and provide a foundation for inclusive use:

- Semantic page structure and clear heading hierarchy
- Keyboard-accessible navigation and interactive elements
- Visible focus states
- Sufficient color contrast
- Readable text sizing and spacing
- Labels for form fields and actions
- Content that remains understandable without relying on color alone

## Conceptual Data Entities
The following conceptual entities define the product domain without prescribing implementation details:

- Trip
  - A planning container for a destination or travel plan
- Traveler
  - The person creating and managing the trip research
- Research Card
  - A saved or captured travel resource with context and metadata
- Source
  - The original public URL or origin of a research card
- Category
  - A type such as flights, accommodation, activities, food, transport, guides, or other
- Decision Status
  - A planning state such as Inbox, Considering, Shortlisted, Booked, or Rejected
- Note
  - A freeform comment or observation attached to a research card
- Price Estimate
  - A rough or expected value associated with an option
- Location
  - A place or destination associated with a research card
- Itinerary Item
  - A selected decision that has been promoted into the trip itinerary

## FE-04 Scope
The FE-04 scope is to create the skeleton of the application and establish the structure required for later product development.

In scope for FE-04:
- Next.js App Router structure
- TypeScript setup
- Tailwind CSS styling foundation
- Server Components by default
- Client Components only where interactivity is genuinely required
- Root layout and responsive navigation
- Routed placeholder pages for every approved screen
- Base design tokens for color, typography, spacing, border radius, shadows, and primary content widths or layout containers
- A health-check page that renders fetched data
- Environment-variable structure with no committed secrets
- Vercel deployment with preview deployments
- Responsive behavior at 375 px and 1280 px

## Explicit FE-04 Non-Goals
The following are not part of FE-04:
- Authentication
- User profiles
- Settings
- Billing
- Collaboration
- Administration
- Full product feature completeness
- Advanced drag-and-drop interactions
- Full persistence or database-backed workflows
- AI-generated itinerary automation
- Maps, visual graphing, or complex multi-user experiences

## Future Product Direction
Future versions may expand the experience with:
- Drag-and-drop organization
- Visual grouping and board-based layouts
- Card connections and relationship mapping
- Maps and location-based views
- Collaboration and sharing
- Import and export workflows
- Persistent storage and account-based experiences
- Authentication and personalization
- AI-assisted organization and recommendation support

## Acceptance Criteria
The FE-04 implementation may be considered complete when all of the following are true:

1. The application includes a root layout with responsive global navigation exposing Trips, New Trip, and Health.
2. The application includes a route for / that renders a Trips Dashboard placeholder.
3. The application includes a route for /trips/new that renders a Create Trip placeholder with a visible form structure, and the placeholder does not require persistence or client-side state to satisfy the FE-04 skeleton.
4. The application includes a route for /trips/[tripId] that renders a Visual Research Workspace placeholder.
5. The application includes a route for /trips/[tripId]/links that renders a Structured Links and Sources View placeholder.
6. The application includes a route for /trips/[tripId]/itinerary that renders a Trip Itinerary placeholder.
7. The application includes a route for /health that renders fetched health data, not a static placeholder alone.
8. The fetched health-check data includes at least application name, status, environment, and timestamp.
9. The health-check page is implemented as a Server Component.
10. The health-check page renders data obtained through fetch and does not become a Client Component unless a future interactive requirement provides a concrete reason.
11. The dynamic trip routes are manually verifiable using the sample trip ID “barcelona” at /trips/barcelona, /trips/barcelona/links, and /trips/barcelona/itinerary, and these routes represent sample placeholder content rather than persisted trip data.
12. When viewing a trip route, the interface exposes trip-level secondary navigation with Workspace, Links, and Itinerary.
13. The UI uses a responsive layout that remains usable at 375 px and 1280 px.
14. The application includes a base visual system with design tokens for color, typography, spacing, border radius, shadows, and primary content widths or layout containers.
15. The implementation does not introduce authentication, billing, profile, settings, collaboration, or admin screens as part of FE-04.
16. The implementation is deployable to Vercel with preview deployment support: the GitHub repository is connected to Vercel, every push to a non-production development branch generates a preview deployment, the preview URL loads successfully with no build errors, environment-variable structure is configured for deployment, and no secrets or real environment values are committed to the repository.
