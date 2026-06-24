import type { DataState } from "./types";

// Seed data for the demo. Loaded into the store on first run (and on "Reset
// demo data"). Dates are set in the near future relative to the demo date so
// the calendar always shows upcoming games. Local-time ISO strings (no "Z")
// so they display naturally regardless of timezone.

// Two of these invite tokens are surfaced in the admin Invites tab so they're
// easy to demo. `INVITE_USED` shows the "used by whom" state.
export const DEMO_INVITE_TOKENS = {
  unusedA: "saints-gold-2026",
  unusedB: "royal-flush-0727",
  used: "old-token-9921",
} as const;

export function createSeed(): DataState {
  return {
    players: [
      {
        id: "p1",
        email: "marcus@example.com",
        realName: "Marcus Dupré",
        totalWinnings: 1240,
        profitLoss: 320,
        role: "admin",
      },
      {
        id: "p2",
        email: "theo@example.com",
        realName: "Theo Boudreaux",
        totalWinnings: 980,
        profitLoss: -150,
        role: "player",
      },
      {
        id: "p3",
        email: "renee@example.com",
        realName: "Renée Fontenot",
        totalWinnings: 1530,
        profitLoss: 540,
        role: "player",
      },
      {
        id: "p4",
        email: "cal@example.com",
        realName: "Cal Thibodeaux",
        totalWinnings: 610,
        profitLoss: -80,
        role: "player",
      },
      {
        id: "p5",
        email: "priya@example.com",
        realName: "Priya Nair",
        totalWinnings: 2100,
        profitLoss: 760,
        role: "player",
      },
      {
        id: "p6",
        email: "dom@example.com",
        realName: "Dom Russo",
        totalWinnings: 430,
        profitLoss: -290,
        role: "player",
      },
    ],

    invites: [
      {
        token: DEMO_INVITE_TOKENS.unusedA,
        email: "newplayer@example.com",
        used: false,
        createdBy: "p1",
      },
      {
        token: DEMO_INVITE_TOKENS.unusedB,
        used: false,
        createdBy: "p1",
      },
      {
        token: DEMO_INVITE_TOKENS.used,
        email: "dom@example.com",
        used: true,
        usedBy: "p6",
        createdBy: "p1",
      },
    ],

    games: [
      {
        // Next up + intentionally full so the queue can be demoed.
        id: "g1",
        title: "Friday Night Hold'em",
        startsAt: "2026-06-26T19:30:00",
        location: "Marcus's place — Mid-City",
        notes: "$40 buy-in, $0.25/$0.50 blinds. BYO drinks, chips provided.",
        maxSeats: 4,
        status: "scheduled",
      },
      {
        id: "g2",
        title: "Sunday Deep Stack",
        startsAt: "2026-06-28T18:00:00",
        location: "The Boudreaux garage",
        notes: "Slower structure, deeper stacks. Good night to learn.",
        maxSeats: 6,
        status: "scheduled",
      },
      {
        id: "g3",
        title: "Holiday Dealer's Choice",
        startsAt: "2026-07-03T20:00:00",
        location: "Marcus's place — Mid-City",
        notes: "Mixed games — Hold'em, Omaha, and whatever the dealer calls.",
        maxSeats: 6,
        status: "scheduled",
      },
      {
        // A past game so admin/games views look lived-in. Hidden from the
        // upcoming calendar.
        id: "g0",
        title: "Memorial Day Cash Game",
        startsAt: "2026-05-25T17:00:00",
        location: "Marcus's place — Mid-City",
        notes: "Long weekend session.",
        maxSeats: 6,
        status: "completed",
      },
    ],

    registrations: [
      // g1 — full (4 seats) + a queue of 1. Marcus (admin) is NOT in it,
      // so signing in as the admin demos "table full → join queue".
      { id: "r1", gameId: "g1", playerId: "p2", status: "seated" },
      { id: "r2", gameId: "g1", playerId: "p3", status: "seated" },
      { id: "r3", gameId: "g1", playerId: "p4", status: "seated" },
      { id: "r4", gameId: "g1", playerId: "p5", status: "seated" },
      { id: "r5", gameId: "g1", playerId: "p6", status: "queued", position: 1 },

      // g2 — open seats, easy to demo a plain "register".
      { id: "r6", gameId: "g2", playerId: "p1", status: "seated" },
      { id: "r7", gameId: "g2", playerId: "p6", status: "seated" },

      // g3 — mostly open.
      { id: "r8", gameId: "g3", playerId: "p3", status: "seated" },

      // g0 — past game, for history.
      { id: "r9", gameId: "g0", playerId: "p1", status: "seated" },
      { id: "r10", gameId: "g0", playerId: "p2", status: "seated" },
      { id: "r11", gameId: "g0", playerId: "p5", status: "seated" },
    ],

    forumPosts: [
      {
        id: "fp1",
        authorId: "p1",
        title: "House Rules & Buy-ins (read before you sit)",
        body: "Standard buy-in is $40, max one rebuy per session. Cash out is settled at the end of the night — no IOUs. Be respectful, no string bets, and phones face-down during a hand. Let's keep it fun.",
        type: "post",
        pinned: true,
        createdAt: "2026-06-20T10:00:00",
      },
      {
        id: "fp2",
        authorId: "p1",
        title: "What night works best going forward?",
        body: "Trying to lock in a regular weekly slot. Vote below — majority wins for July.",
        type: "poll",
        pinned: false,
        createdAt: "2026-06-22T14:30:00",
      },
      {
        id: "fp3",
        authorId: "p1",
        title: "New felt table is in 🎉",
        body: "Picked up a proper 8-seat felt table this weekend. Comes with a real dealer button and cup holders. Come break it in Friday.",
        type: "post",
        pinned: false,
        createdAt: "2026-06-18T09:15:00",
      },
    ],

    pollOptions: [
      { id: "po1", postId: "fp2", text: "Thursday" },
      { id: "po2", postId: "fp2", text: "Friday" },
      { id: "po3", postId: "fp2", text: "Saturday" },
    ],

    pollVotes: [
      { postId: "fp2", optionId: "po2", voterId: "p2" },
      { postId: "fp2", optionId: "po2", voterId: "p3" },
      { postId: "fp2", optionId: "po3", voterId: "p4" },
      { postId: "fp2", optionId: "po2", voterId: "p5" },
    ],
  };
}
