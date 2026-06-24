// Core domain types for the Poker Club demo.
// NOTE: This is a demo. `email` and `profitLoss` are PRIVATE fields — in
// production these become row/column-level secured columns. In the demo we
// only ever hide them in the UI (see lib/privacy.ts). Never render another
// player's email or profitLoss.

export type Role = "player" | "admin";

export interface Player {
  id: string;
  /** Private — sign-in identifier. Only the player themselves + admins see it. */
  email: string;
  realName: string;
  /** Public — visible to everyone. */
  totalWinnings: number;
  /** Private — only the player themselves + admins see it. */
  profitLoss: number;
  role: Role;
}

export interface Invite {
  token: string;
  /** Optional pre-fill for who the invite is intended for. */
  email?: string;
  used: boolean;
  /** Player id that consumed the invite. */
  usedBy?: string;
  /** Player id (admin) that generated the invite. */
  createdBy: string;
}

export type GameStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Game {
  id: string;
  title: string;
  /** ISO 8601 timestamp. */
  startsAt: string;
  location?: string;
  notes?: string;
  maxSeats: number;
  status: GameStatus;
}

export type RegistrationStatus = "seated" | "queued";

export interface Registration {
  id: string;
  gameId: string;
  playerId: string;
  status: RegistrationStatus;
  /** 1-based queue position; only set when status === "queued". */
  position?: number;
}

export type ForumPostType = "post" | "poll";

export interface ForumPost {
  id: string;
  authorId: string;
  title: string;
  body: string;
  type: ForumPostType;
  pinned: boolean;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface PollOption {
  id: string;
  postId: string;
  text: string;
}

export interface PollVote {
  postId: string;
  optionId: string;
  voterId: string;
}

/** The full persisted store shape. */
export interface DataState {
  players: Player[];
  invites: Invite[];
  games: Game[];
  registrations: Registration[];
  forumPosts: ForumPost[];
  pollOptions: PollOption[];
  pollVotes: PollVote[];
}
