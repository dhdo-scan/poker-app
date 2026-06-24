// Pure read helpers over the store data. Kept framework-free so they can be
// used inside components or tests without pulling in the store.

import type {
  ForumPost,
  Game,
  PollOption,
  PollVote,
  Player,
  Registration,
} from "./types";

export const GAME_OPEN_STATUSES = new Set(["scheduled", "in_progress"]);

export function playerById(players: Player[], id: string | null | undefined) {
  return players.find((p) => p.id === id);
}

/** Seated registrations for a game, in seat order. */
export function seatedFor(registrations: Registration[], gameId: string) {
  return registrations.filter(
    (r) => r.gameId === gameId && r.status === "seated"
  );
}

/** Queued registrations for a game, ordered by position. */
export function queuedFor(registrations: Registration[], gameId: string) {
  return registrations
    .filter((r) => r.gameId === gameId && r.status === "queued")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export function registrationFor(
  registrations: Registration[],
  gameId: string,
  playerId: string | null | undefined
) {
  if (!playerId) return undefined;
  return registrations.find(
    (r) => r.gameId === gameId && r.playerId === playerId
  );
}

/** Scheduled / in-progress games, soonest first. Excludes cancelled + completed. */
export function upcomingGames(games: Game[]) {
  return games
    .filter((g) => GAME_OPEN_STATUSES.has(g.status))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/** All games for admin, soonest first, with open games before closed ones. */
export function allGamesSorted(games: Game[]) {
  return [...games].sort((a, b) => {
    const aOpen = GAME_OPEN_STATUSES.has(a.status) ? 0 : 1;
    const bOpen = GAME_OPEN_STATUSES.has(b.status) ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    return a.startsAt.localeCompare(b.startsAt);
  });
}

export function nextGame(games: Game[]) {
  return upcomingGames(games)[0];
}

/** Forum posts ordered for display: pinned first, then newest. */
export function sortedPosts(posts: ForumPost[]) {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function mostRecentPinned(posts: ForumPost[]) {
  return sortedPosts(posts.filter((p) => p.pinned))[0];
}

export interface PollResult {
  options: { id: string; text: string; count: number; pct: number }[];
  total: number;
  leadingId?: string;
}

export function pollResultsFor(
  options: PollOption[],
  votes: PollVote[],
  postId: string
): PollResult {
  const opts = options.filter((o) => o.postId === postId);
  const postVotes = votes.filter((v) => v.postId === postId);
  const total = postVotes.length;
  let leadingId: string | undefined;
  let leadingCount = -1;
  const results = opts.map((o) => {
    const count = postVotes.filter((v) => v.optionId === o.id).length;
    if (count > leadingCount) {
      leadingCount = count;
      leadingId = o.id;
    }
    return {
      id: o.id,
      text: o.text,
      count,
      pct: total === 0 ? 0 : Math.round((count / total) * 100),
    };
  });
  // No leader when there are no votes.
  return { options: results, total, leadingId: total > 0 ? leadingId : undefined };
}

export function voteOf(
  votes: PollVote[],
  postId: string,
  voterId: string | null | undefined
) {
  if (!voterId) return undefined;
  return votes.find((v) => v.postId === postId && v.voterId === voterId)
    ?.optionId;
}

/** Upcoming registrations for a player, with their game, for the dashboard. */
export function myUpcomingRegistrations(
  registrations: Registration[],
  games: Game[],
  playerId: string | null | undefined
) {
  if (!playerId) return [];
  return upcomingGames(games)
    .map((game) => ({
      game,
      registration: registrationFor(registrations, game.id, playerId),
    }))
    .filter((x) => x.registration);
}
