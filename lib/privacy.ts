// UI-level privacy enforcement for the demo.
//
// Product rule: other players never see anyone's `email` or `profitLoss`.
// - A player sees their OWN email / totalWinnings / profitLoss.
// - Admins see everything.
// - For everyone else, only `realName` + `totalWinnings` are ever rendered.
//
// In production this becomes real row/column-level security so private fields
// can't be queried by other players at all — not merely hidden in the UI.

import type { Player, Role } from "./types";

export interface Viewer {
  viewRole: Role;
  currentPlayerId: string | null;
}

/** Whether the viewer may see `email` / `profitLoss` for the target player. */
export function canSeePrivateFields(viewer: Viewer, targetId: string): boolean {
  return viewer.viewRole === "admin" || viewer.currentPlayerId === targetId;
}

export interface PublicPlayer {
  id: string;
  realName: string;
  totalWinnings: number;
}

/** Strip a player down to only the fields safe to show to others. */
export function toPublicPlayer(player: Player): PublicPlayer {
  return {
    id: player.id,
    realName: player.realName,
    totalWinnings: player.totalWinnings,
  };
}
