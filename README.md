# LocalCircle

**Live Deployment:** [https://localcircle-sy.vercel.app/](https://localcircle-sy.vercel.app/)

LocalCircle is a modern, hyper-local community platform designed to connect verified residents within specific geographic boundaries (neighborhoods). It serves as a secure digital town square for local news, peer-to-peer marketplaces, business directories, and real-time emergency alerts.

Built with **Next.js 14**, **Supabase**, **Zustand**, and a custom implementation of the **Material Design 3** styling system.

---

## 🏗 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Backend/Database:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** Zustand
- **Styling:** Tailwind CSS (Custom "Stitch" Material Design System)
- **Icons:** Google Material Symbols

---

## 📂 Project Structure

### `/app` (Next.js App Router)
Contains all the primary routes and server actions for the application.
- **`/actions`**: Next.js Server Actions. Handles secure, server-side data fetching and mutations (e.g., `directory.ts`, `feed.ts`, `marketplace.ts`).
- **`/alerts`**: The Real-time emergency alerts hub.
- **`/directory`**: Verified local Business Directory where users can find or list community businesses.
- **`/groups`**: Hyper-local community groups and discussions.
- **`/marketplace`**: Peer-to-peer local marketplace for buying, selling, or giving away items.
- **`/news`**: Automated local news aggregation feed.
- **`/login` & `/settings`**: User authentication, profile management, and neighborhood assignment.

### `/components` (React Components)
Modular, reusable UI architecture divided by domain.
- **`/ui`**: Core layout elements (`header.tsx`, `navigation-sidebar.tsx`).
- **`/dashboard`**: High-level data widgets (e.g., `neighborhood-trust.tsx` which calculates live platform safety metrics).
- **`/feed`**: Timeline and post creation modules.
- **`/alerts`**: Global floating toast notifications (`realtime-alerts.tsx`) connected to Supabase WebSockets.
- **`/onboarding`**: Geolocation and mock-location verification prompts (`location-prompt.tsx`).

### `/supabase` (Database & Backend Infrastructure)
- **`/migrations`**: Contains the complete SQL schema required to run the platform.
  - Implements the strict `neighborhood_id` scoping to ensure users only see data relevant to their physical location.
  - Contains rigorous **Row Level Security (RLS)** policies protecting user privacy.
  - Triggers and functions for automated view counts, group member counts, and profile creation.

### `/store` (Global State)
- **`useAppStore.ts`**: A Zustand store managing the user's authentication session, active `neighborhood_id`, and transient real-time alerts.

---

## 🛡 Security & Data Architecture (RLS)

A core pillar of LocalCircle is privacy and geographic boundaries. The database uses PostGIS for geographic calculations and enforces **Row Level Security (RLS)** on all tables. 

Every query to tables like `posts`, `marketplace_items`, and `businesses` is intercepted at the database level and verified against the user's authenticated `neighborhood_id`. A user from "Northside" physically cannot query or access posts from "Southside".

---

## 🎨 Design System ("Stitch")

LocalCircle utilizes a highly customized Tailwind configuration inspired by Material Design 3. Instead of static hex codes, the application uses dynamic semantic tokens.

**Key Tokens:**
- `bg-surface`: The standard background color for the application.
- `bg-surface-container-lowest` to `highest`: Used for defining elevation and depth (cards, sidebars, modals) without relying entirely on drop-shadows.
- `text-on-surface`: High-contrast text colors designed to dynamically adapt to the underlying surface.
- `text-primary` / `bg-primary`: Reserved strictly for main calls-to-action and brand highlighting (Forest Green: `#0A5C36`).

## 🚀 Deployment Strategy

This application is designed for the modern serverless Edge:
1. **Frontend Hosting:** [Vercel](https://vercel.com) (Recommended) for zero-config Next.js caching, Server Action optimization, and edge routing.
2. **Backend Hosting:** [Supabase Cloud](https://supabase.com) for managed PostgreSQL, instant GraphQL/REST APIs, Auth, and WebSockets.

To deploy: Add your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to your Vercel Environment Variables, link your GitHub repository, and push to `main`.
