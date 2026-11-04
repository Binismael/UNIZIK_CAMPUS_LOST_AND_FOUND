# CampusLost&Found

Find what you lost. Return what you found.

CampusLost&Found is an AI-powered lost-and-found platform for UNIZIK students. A finder uploads a photo of an item, Gemini automatically tags it (type, colour, brand, marks), and owners search in plain language like "black Dell charger with blue tape". Owners claim items by giving proof, and finders approve, so contact details stay private until a claim is approved.

Built for BUILDUP UNIZIK 2026 (GDG on Campus UNIZIK x NACOS).

## Features
- Sign in with email or Google, plus a one-time campus profile
- Report a found item with automatic Gemini tagging
- Plain-language search with ranked matches
- Proof-based claims, approvals and handover
- Mobile and desktop layouts

## Tech stack
React + TypeScript (Vite), Tailwind CSS, Supabase (Auth, Postgres, Storage, Edge Functions), Gemini API, Vercel

## Live demo
https://unizik-campus-lost-and-found.vercel.app
## Develop locally

```bash
cp .env.example .env
corepack enable
pnpm install
pnpm dev
```

`.env.example` sets `AUTH_DISABLED=true` as a commented-out option; uncomment it
to skip sign-in while developing.

## Project layout

- `app/`: routes and UI components
- `actions/`: operations shared by the UI and the app's agent
- `server/`: server plugins and the database client
- `drizzle/`: schema and migrations; start with `drizzle/START_HERE.md`

Framework docs: [agent-native.com/docs](https://agent-native.com/docs?utm_source=github&utm_medium=referral&utm_content=fusion-starter-readme).
