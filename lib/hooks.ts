"use client";

import { useStore } from "./store";
import type { Viewer } from "./privacy";

/** The current viewer context for privacy + gating decisions. */
export function useViewer(): Viewer {
  const viewRole = useStore((s) => s.viewRole);
  const currentPlayerId = useStore((s) => s.currentPlayerId);
  return { viewRole, currentPlayerId };
}

export function useCurrentPlayer() {
  const id = useStore((s) => s.currentPlayerId);
  return useStore((s) => s.players.find((p) => p.id === id));
}

export function useIsAdmin() {
  return useStore((s) => s.viewRole === "admin");
}
