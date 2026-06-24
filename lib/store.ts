"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  DataState,
  ForumPost,
  ForumPostType,
  Game,
  GameStatus,
  Player,
  Registration,
  Role,
} from "./types";
import { createSeed } from "./seed";

const STORAGE_KEY = "poker-club-demo-v1";

// --- id helper (client-only; actions never run during SSR) ------------------
let counter = 0;
function uid(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

// --- queue rebalancing -------------------------------------------------------
// The single source of truth for seat/queue mechanics. After any add/remove we
// re-run this for the affected game: seated members keep their seats, queued
// members are promoted from the front while seats are open, and the remaining
// queue is renumbered 1..n. register/drop/kick all funnel through here.
function rebalance(regs: Registration[], game: Game): Registration[] {
  const others = regs.filter((r) => r.gameId !== game.id);
  const gameRegs = regs.filter((r) => r.gameId === game.id);
  const seated = gameRegs.filter((r) => r.status === "seated");
  const queued = gameRegs
    .filter((r) => r.status === "queued")
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  let openSeats = game.maxSeats - seated.length;
  const newSeated: Registration[] = [...seated.map((r) => ({ ...r, position: undefined }))];
  const stillQueued: Registration[] = [];

  for (const q of queued) {
    if (openSeats > 0) {
      newSeated.push({ ...q, status: "seated", position: undefined });
      openSeats -= 1;
    } else {
      stillQueued.push(q);
    }
  }

  const renumbered = stillQueued.map((q, i) => ({
    ...q,
    status: "queued" as const,
    position: i + 1,
  }));

  return [...others, ...newSeated, ...renumbered];
}

// --- store shape -------------------------------------------------------------
interface SessionState {
  /** Currently signed-in player id, or null when logged out. */
  currentPlayerId: string | null;
  /**
   * Dev-only role toggle. The effective role used for gating + privacy. It is
   * reset to the player's real role on sign-in, but the demo toggle can flip it
   * so both player and admin views can be shown from one account.
   */
  viewRole: Role;
}

interface Actions {
  // session
  signInAs: (playerId: string) => void;
  signOut: () => void;
  setViewRole: (role: Role) => void;

  // players
  addPlayer: (data: {
    email: string;
    realName: string;
    role?: Role;
    totalWinnings?: number;
    profitLoss?: number;
  }) => Player;
  updatePlayer: (
    id: string,
    patch: Partial<Omit<Player, "id" | "email">>
  ) => void;

  // invites
  isInviteValid: (token: string) => boolean;
  generateInvite: (createdBy: string, email?: string) => string;
  revokeInvite: (token: string) => void;
  /** Accept an invite: creates a player, marks the invite used, signs in. */
  acceptInvite: (
    token: string,
    data: { email: string; realName: string }
  ) => { ok: boolean; playerId?: string };

  // games
  addGame: (data: Omit<Game, "id" | "status"> & { status?: GameStatus }) => Game;
  updateGame: (id: string, patch: Partial<Omit<Game, "id">>) => void;
  cancelGame: (id: string) => void;
  deleteGame: (id: string) => void;

  // registrations / queue
  register: (gameId: string, playerId: string) => void;
  drop: (gameId: string, playerId: string) => void;
  kick: (gameId: string, playerId: string) => void;

  // forum
  addPost: (data: {
    authorId: string;
    title: string;
    body: string;
    type: ForumPostType;
    pinned?: boolean;
    options?: string[];
  }) => string;
  updatePost: (
    id: string,
    patch: Partial<Pick<ForumPost, "title" | "body" | "pinned">>
  ) => void;
  setPollOptions: (postId: string, options: { id?: string; text: string }[]) => void;
  togglePin: (id: string) => void;
  deletePost: (id: string) => void;
  castVote: (postId: string, optionId: string, voterId: string) => void;

  // demo
  resetDemo: () => void;

  // hydration
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
}

export type Store = DataState & SessionState & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      currentPlayerId: null,
      viewRole: "player",
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      // --- session ---------------------------------------------------------
      signInAs: (playerId) => {
        const player = get().players.find((p) => p.id === playerId);
        set({ currentPlayerId: playerId, viewRole: player?.role ?? "player" });
      },
      signOut: () => set({ currentPlayerId: null, viewRole: "player" }),
      setViewRole: (role) => set({ viewRole: role }),

      // --- players ---------------------------------------------------------
      addPlayer: (data) => {
        const player: Player = {
          id: uid("p"),
          email: data.email,
          realName: data.realName,
          totalWinnings: data.totalWinnings ?? 0,
          profitLoss: data.profitLoss ?? 0,
          role: data.role ?? "player",
        };
        set((s) => ({ players: [...s.players, player] }));
        return player;
      },
      updatePlayer: (id, patch) =>
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),

      // --- invites ---------------------------------------------------------
      isInviteValid: (token) => {
        const inv = get().invites.find((i) => i.token === token);
        return !!inv && !inv.used;
      },
      generateInvite: (createdBy, email) => {
        const token = `inv-${Math.random().toString(36).slice(2, 8)}-${Date.now()
          .toString(36)
          .slice(-4)}`;
        set((s) => ({
          invites: [...s.invites, { token, email, used: false, createdBy }],
        }));
        return token;
      },
      revokeInvite: (token) =>
        set((s) => ({
          // Only unused invites can be revoked.
          invites: s.invites.filter((i) => i.token !== token || i.used),
        })),
      acceptInvite: (token, data) => {
        const inv = get().invites.find((i) => i.token === token);
        if (!inv || inv.used) return { ok: false };
        const player = get().addPlayer({
          email: data.email,
          realName: data.realName,
          role: "player",
        });
        set((s) => ({
          invites: s.invites.map((i) =>
            i.token === token ? { ...i, used: true, usedBy: player.id } : i
          ),
          currentPlayerId: player.id,
          viewRole: "player",
        }));
        return { ok: true, playerId: player.id };
      },

      // --- games -----------------------------------------------------------
      addGame: (data) => {
        const game: Game = {
          id: uid("g"),
          title: data.title,
          startsAt: data.startsAt,
          location: data.location,
          notes: data.notes,
          maxSeats: data.maxSeats,
          status: data.status ?? "scheduled",
        };
        set((s) => ({ games: [...s.games, game] }));
        return game;
      },
      updateGame: (id, patch) => {
        set((s) => ({
          games: s.games.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        }));
        // Capacity may have changed — rebalance the affected game.
        const game = get().games.find((g) => g.id === id);
        if (game) set((s) => ({ registrations: rebalance(s.registrations, game) }));
      },
      cancelGame: (id) =>
        set((s) => ({
          games: s.games.map((g) =>
            g.id === id ? { ...g, status: "cancelled" } : g
          ),
        })),
      deleteGame: (id) =>
        set((s) => ({
          games: s.games.filter((g) => g.id !== id),
          registrations: s.registrations.filter((r) => r.gameId !== id),
        })),

      // --- registrations / queue ------------------------------------------
      register: (gameId, playerId) => {
        const state = get();
        const game = state.games.find((g) => g.id === gameId);
        if (!game || game.status !== "scheduled") return;
        const already = state.registrations.find(
          (r) => r.gameId === gameId && r.playerId === playerId
        );
        if (already) return;

        const maxPos = state.registrations
          .filter((r) => r.gameId === gameId && r.status === "queued")
          .reduce((m, r) => Math.max(m, r.position ?? 0), 0);

        const next: Registration = {
          id: uid("r"),
          gameId,
          playerId,
          status: "queued",
          position: maxPos + 1,
        };
        set({ registrations: rebalance([...state.registrations, next], game) });
      },
      drop: (gameId, playerId) => {
        const game = get().games.find((g) => g.id === gameId);
        const filtered = get().registrations.filter(
          (r) => !(r.gameId === gameId && r.playerId === playerId)
        );
        set({ registrations: game ? rebalance(filtered, game) : filtered });
      },
      kick: (gameId, playerId) => get().drop(gameId, playerId),

      // --- forum -----------------------------------------------------------
      addPost: (data) => {
        const id = uid("fp");
        const post: ForumPost = {
          id,
          authorId: data.authorId,
          title: data.title,
          body: data.body,
          type: data.type,
          pinned: data.pinned ?? false,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ forumPosts: [...s.forumPosts, post] }));
        if (data.type === "poll" && data.options) {
          const opts = data.options
            .filter((t) => t.trim())
            .map((text) => ({ id: uid("po"), postId: id, text: text.trim() }));
          set((s) => ({ pollOptions: [...s.pollOptions, ...opts] }));
        }
        return id;
      },
      updatePost: (id, patch) =>
        set((s) => ({
          forumPosts: s.forumPosts.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        })),
      setPollOptions: (postId, options) => {
        // Keep existing option ids (and their votes) where provided; create
        // new ones for added options; drop options (and their votes) removed.
        const kept = options.map((o) => ({
          id: o.id ?? uid("po"),
          postId,
          text: o.text.trim(),
        }));
        const keptIds = new Set(kept.map((o) => o.id));
        set((s) => ({
          pollOptions: [
            ...s.pollOptions.filter((o) => o.postId !== postId),
            ...kept,
          ],
          pollVotes: s.pollVotes.filter(
            (v) => v.postId !== postId || keptIds.has(v.optionId)
          ),
        }));
      },
      togglePin: (id) =>
        set((s) => ({
          forumPosts: s.forumPosts.map((p) =>
            p.id === id ? { ...p, pinned: !p.pinned } : p
          ),
        })),
      deletePost: (id) =>
        set((s) => ({
          forumPosts: s.forumPosts.filter((p) => p.id !== id),
          pollOptions: s.pollOptions.filter((o) => o.postId !== id),
          pollVotes: s.pollVotes.filter((v) => v.postId !== id),
        })),
      castVote: (postId, optionId, voterId) =>
        set((s) => ({
          pollVotes: [
            // one vote per poll per player — replace any prior vote
            ...s.pollVotes.filter(
              (v) => !(v.postId === postId && v.voterId === voterId)
            ),
            { postId, optionId, voterId },
          ],
        })),

      // --- demo ------------------------------------------------------------
      resetDemo: () => {
        set({
          ...createSeed(),
          currentPlayerId: null,
          viewRole: "player",
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : dummyStorage()
      ),
      // Persist data + session; actions and the hydration flag are excluded.
      partialize: (s) => ({
        players: s.players,
        invites: s.invites,
        games: s.games,
        registrations: s.registrations,
        forumPosts: s.forumPosts,
        pollOptions: s.pollOptions,
        pollVotes: s.pollVotes,
        currentPlayerId: s.currentPlayerId,
        viewRole: s.viewRole,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// No-op storage for SSR so persist never touches a missing localStorage.
function dummyStorage(): Storage {
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  } as Storage;
}
