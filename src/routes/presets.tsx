import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ALL_CELLS,
  cellColor,
} from "@/lib/hexchess/board";
import { PRESETS, Preset } from "@/lib/hexchess/presets";
import wK from "@/assets/pieces/wK.svg";
import wQ from "@/assets/pieces/wQ.svg";
import wR from "@/assets/pieces/wR.svg";
import wB from "@/assets/pieces/wB.svg";
import wN from "@/assets/pieces/wN.svg";
import wP from "@/assets/pieces/wP.svg";
import bK from "@/assets/pieces/bK.svg";
import bQ from "@/assets/pieces/bQ.svg";
import bR from "@/assets/pieces/bR.svg";
import bB from "@/assets/pieces/bB.svg";
import bN from "@/assets/pieces/bN.svg";
import bP from "@/assets/pieces/bP.svg";

const PIECE_IMG: Record<string, string> = {
  wK, wQ, wR, wB, wN, wP, bK, bQ, bR, bB, bN, bP,
};

export const PRESET_STORAGE_KEY = "hexchess:preset";

export const Route = createFileRoute("/presets")({
  head: () => ({
    meta: [
      { title: "Presets — Featured Hex Chess Positions" },
      {
        name: "description",
        content:
          "Hand-crafted hex chess positions for opening, middlegame, and endgame practice. Pick a preset and jump straight into the action.",
      },
      { property: "og:title", content: "Presets — Featured Hex Chess Positions" },
      {
        property: "og:description",
        content:
          "Five medieval-named starting positions for Hex Chess: openings, middlegame studies, and endgame puzzles.",
      },
    ],
  }),
  component: PresetsPage,
});

function PresetsPage() {
  const navigate = useNavigate();

  const start = (p: Preset) => {
    try {
      const payload = {
        id: p.id,
        turn: p.turn,
        pieces: Array.from(p.board.entries()).map(([k, piece]) => ({
          k,
          c: piece.color,
          t: piece.type,
        })),
      };
      sessionStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* sessionStorage unavailable — Play page will fall back to a fresh game */
    }
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Presets
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Hand-crafted starting positions, each named for the shape of the
            battle ahead. Pick one to begin a new game from that position.
          </p>
        </header>

        <ul className="grid gap-6 md:grid-cols-2">
          {PRESETS.map((p) => (
            <li key={p.id}>
              <article className="group flex flex-col h-full rounded-2xl border border-border bg-card/60 overflow-hidden shadow-lg hover:shadow-2xl hover:border-primary/60 transition-all">
                <div className="aspect-[4/3] bg-background/30 flex items-center justify-center p-3 border-b border-border">
                  <MiniBoard preset={p} />
                </div>

                <div className="flex flex-col flex-1 p-5 gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-semibold tracking-tight">
                      {p.name}
                    </h2>
                    <span className="shrink-0 text-[10px] uppercase tracking-wider font-semibold rounded-full px-2 py-1 bg-primary/15 text-primary border border-primary/30">
                      {p.phase}
                    </span>
                  </div>

                  <p className="text-sm italic text-muted-foreground">
                    {p.tagline}
                  </p>
                  <p className="text-sm text-foreground/85 leading-relaxed flex-1">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {p.turn === "w" ? "White" : "Black"} to move
                    </span>
                    <button
                      onClick={() => start(p)}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
                    >
                      Play this position
                    </button>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <div className="mt-10">
          <Link
            to="/"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            ← Back to game
          </Link>
        </div>
      </div>
    </div>
  );
}

/* --- Miniature preview board --- */

const HEX = 14;

function hexToPixel(q: number, r: number) {
  const x = HEX * 1.5 * q;
  const y = -HEX * Math.sqrt(3) * (r + q / 2);
  return { x, y };
}

function hexPoints(cx: number, cy: number, size: number) {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i);
    pts.push(`${cx + size * Math.cos(a)},${cy + size * Math.sin(a)}`);
  }
  return pts.join(" ");
}

function MiniBoard({ preset }: { preset: Preset }) {
  const dims = useMemo(() => {
    const pos = ALL_CELLS.map((c) => hexToPixel(c.q, c.r));
    const xs = pos.map((p) => p.x);
    const ys = pos.map((p) => p.y);
    const pad = HEX + 4;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { minX, minY, w: maxX - minX, h: maxY - minY };
  }, []);

  const fillFor = (c: 0 | 1 | 2) =>
    c === 0 ? "var(--hex-light)" : c === 1 ? "var(--hex-mid)" : "var(--hex-dark)";

  return (
    <svg
      viewBox={`${dims.minX} ${dims.minY} ${dims.w} ${dims.h}`}
      className="w-full h-full"
      aria-label={`${preset.name} preview`}
    >
      {ALL_CELLS.map(({ q, r }) => {
        const k = `${q},${r}`;
        const { x, y } = hexToPixel(q, r);
        const piece = preset.board.get(k);
        return (
          <g key={k}>
            <polygon
              points={hexPoints(x, y, HEX)}
              fill={fillFor(cellColor(q, r))}
              stroke="var(--hex-stroke)"
              strokeWidth={0.4}
            />
            {piece && (
              <image
                href={PIECE_IMG[`${piece.color}${piece.type}`]}
                x={x - HEX * 0.85}
                y={y - HEX * 0.85}
                width={HEX * 1.7}
                height={HEX * 1.7}
                preserveAspectRatio="xMidYMid meet"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}