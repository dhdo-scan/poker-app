import { Club, Spade } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Decorative black + gold backdrop for the entry screens (login / invite).
 * Layered gold glow + oversized faint card-suit glyphs + a vignette. Pure
 * CSS/SVG, no images. Stays in the black/gold lane (no felt green here — that's
 * scoped to game views).
 */
export function SuitBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Top gold glow — slow breathing pulse */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 50% -8%, rgba(228,207,161,0.18), transparent 70%)",
          animation: "glowPulse 9s ease-in-out infinite",
        }}
      />
      {/* Secondary low gold wash */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 110%, rgba(211,188,141,0.07), transparent 70%)",
        }}
      />

      {/* Oversized faint suit glyphs */}
      <Spade
        className="absolute -top-10 -left-12 size-72 -rotate-[18deg] text-primary/[0.05]"
        strokeWidth={1}
      />
      <Club
        className="absolute -right-12 bottom-16 size-64 rotate-12 text-primary/[0.05]"
        strokeWidth={1}
      />
      <Spade
        className="absolute -top-16 right-1/4 size-44 rotate-6 text-primary/[0.04]"
        strokeWidth={1}
      />

      {/* Vignette to focus the center */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 120% at 50% 25%, transparent 50%, rgba(0,0,0,0.6))",
        }}
      />
    </div>
  );
}
