# The Felt — Poker Club (clickable demo)

A clickable demo of a private, invite-only web app for a recurring home poker
game. It shows the concept end-to-end: an invite gate, a schedule, table
sign-ups with a queue, a host forum with polls, and player account settings —
the kind of thing that replaces a Snapchat group chat.

This is a **demo**. There is no real database, email auth, or invite emails.
Everything runs on seed data + mock auth in the browser, persisted to
`localStorage`, so it looks and clicks like the real thing and survives a
refresh.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. You'll land on the invite-gated sign-in screen.

### Demo tips

- **Sign in** by picking any seeded player on `/login`. Marcus Dupré is the
  host (admin); everyone else is a player.
- **Role toggle** (top-right): flip between *Player* and *Admin* views without
  switching accounts — handy for showing both sides during a pitch.
- **Try the queue:** open *Friday Night Hold'em* — it's full, so you'll
  *Join queue*. In the admin **Registrations** tab, remove a seated player and
  watch the next person get promoted automatically.
- **Invite flow:** the admin **Invites** tab has two working demo links. Open
  one (e.g. `/invite/saints-gold-2026`) to create a new account.
- **Reset demo data:** admin → **Reset demo data** restores the original seed
  and clears `localStorage`. Great for re-running the pitch.

## Stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS + shadcn/ui** (Base UI components)
- **Zustand** store seeded from `lib/seed.ts`, persisted to `localStorage`
  (`lib/store.ts`). No server, no DB, no API routes.

Design: a dark-first New Orleans Saints palette (black + old gold), mobile-first
since players open it on their phones. Felt green is scoped to the game-detail
and admin Registrations table views only.

## Project map

```
app/
  login/                 "sign in as" picker (mock auth)
  invite/[token]/        accept an invite -> create account -> session
  (app)/                 session-gated routes (redirect to /login without one)
    page.tsx             dashboard
    calendar/            upcoming games
    games/[id]/          game detail + felt table + register/queue/drop
    forum/ , forum/[id]/ posts + polls
    settings/            edit name, read-only email, own private P/L
    admin/               admin-only: players, invites, games, registrations, forum, reset
lib/
  types.ts  seed.ts  store.ts  selectors.ts  privacy.ts  format.ts  status.ts
components/  shared UI (felt-table, game-card, poll-view, confirm-dialog, ...) + ui/ (shadcn)
```

## What's faked vs. production

Everything below is faked for the demo and is what it becomes if this goes
real. None of it is needed for the demo to tell the story.

| Area | Demo | Production |
| --- | --- | --- |
| **Auth** | "sign in as" picker | Real email auth (magic link or password) |
| **Invites** | Seeded valid tokens | Server-validated single-use tokens with expiry; real invite emails |
| **Storage** | `localStorage` store | A real database (e.g. Postgres/Supabase) with per-user rows |
| **Privacy** | UI hides others' `email` / `profitLoss` | Enforced server-side (row/column-level security) so private fields can't be queried by other players at all |
| **Winnings / P&L** | Admin types the numbers in | Optionally auto-computed from per-game buy-in / cash-out results |
