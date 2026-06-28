import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { HexBoard } from "@/components/HexBoard";
import { GamePanel } from "@/components/GamePanel";
import {
  GameState,
  agreeDraw,
  makeMove,
  newGame,
  newGameFromBoard,
  resign,
} from "@/lib/hexchess/game";
import { Board, Color, Move, PieceType } from "@/lib/hexchess/types";
import { PRESET_STORAGE_KEY } from "@/routes/presets";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hex Chess — Play Gliński's Hexagonal Chess Online Free" },
      {
        name: "description",
        content:
          "Hex Chess: play Gliński's Hexagonal Chess free online. 91-hex board, full rules, pass-and-play with smooth board rotation. No signup.",
      },
      { name: "keywords", content: "hex chess, hexagonal chess, Gliński chess, hex chess online, play hexagonal chess, 91 hex chess board" },
      { property: "og:title", content: "Hex Chess — Play Gliński's Hexagonal Chess Online" },
      { property: "og:description", content: "Free online Hex Chess. Gliński's 91-hex variant with full rules and pass-and-play." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hexchess2pl.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://hexchess2pl.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Hex Chess",
          alternateName: "Hexagonal Chess",
          url: "https://hexchess2pl.lovable.app/",
          description:
            "Free browser game for Gliński's Hexagonal Chess on a 91-hex board with full rules and pass-and-play.",
          applicationCategory: "GameApplication",
          genre: "Board game, Chess variant",
          operatingSystem: "Any (web browser)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  component: Index,
});

function loadPresetGame(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PRESET_STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(PRESET_STORAGE_KEY);
    const data = JSON.parse(raw) as {
      turn: Color;
      pieces: Array<{ k: string; c: Color; t: PieceType }>;
    };
    const board: Board = new Map();
    for (const p of data.pieces) board.set(p.k, { color: p.c, type: p.t });
    return newGameFromBoard(board, data.turn);
  } catch {
    return null;
  }
}

function Index() {
  const [history, setHistory] = useState<GameState[]>(() => [
    loadPresetGame() ?? newGame(),
  ]);
  const [rotateEnabled, setRotateEnabled] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [showOutcome, setShowOutcome] = useState(false);

  const state = history[history.length - 1];

  useEffect(() => {
    if (!rotateEnabled) {
      setRotation(0);
      return;
    }
    setRotation(state.turn === "w" ? 0 : 180);
  }, [state.turn, rotateEnabled]);

  useEffect(() => {
    if (state.status !== "active") {
      setShowOutcome(true);
    }
  }, [state.status]);

  const onMove = (m: Move) => {
    setHistory((h) => [...h, makeMove(h[h.length - 1], m)]);
  };

  const onNew = () => {
    setHistory([newGame()]);
    setShowOutcome(false);
  };

  const onUndo = () => {
    if (history.length > 1) setHistory((h) => h.slice(0, -1));
  };

  const onResign = (color: "w" | "b") => {
    setHistory((h) => [...h.slice(0, -1), resign(h[h.length - 1], color)]);
  };

  const onOfferDraw = () => {
    setHistory((h) => [...h.slice(0, -1), agreeDraw(h[h.length - 1])]);
  };


  const outcomeText = (() => {
    switch (state.status) {
      case "checkmate":
        return { title: "Checkmate", sub: `${state.winner === "w" ? "White" : "Black"} wins` };
      case "resigned":
        return { title: "Forfeit", sub: `${state.winner === "w" ? "White" : "Black"} wins by resignation` };
      case "stalemate":
        return { title: "Stalemate", sub: "Draw — no legal moves" };
      case "draw-repetition":
        return { title: "Draw", sub: "Threefold repetition" };
      case "draw-agreement":
        return { title: "Draw", sub: "Agreed by both players" };
      default:
        return null;
    }
  })();

  return (
    <div className="h-full text-foreground">
      <div className="mx-auto max-w-7xl p-3 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6">
        <main className="flex-1 min-w-0 bg-card/40 border border-border rounded-2xl p-2 md:p-4 shadow-xl relative">
          <HexBoard state={state} onMove={onMove} rotation={rotation} />
          {showOutcome && outcomeText && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm rounded-2xl animate-fade-in z-20"
              onClick={() => setShowOutcome(false)}
            >
              <div className="bg-card border-2 border-primary rounded-2xl px-8 py-6 shadow-2xl text-center animate-scale-in">
                <p className="text-3xl font-bold text-primary">{outcomeText.title}</p>
                <p className="mt-1 text-base text-foreground">{outcomeText.sub}</p>
                <p className="mt-3 text-xs text-muted-foreground">Click anywhere to dismiss</p>
              </div>
            </div>
          )}
        </main>
        <GamePanel
          state={state}
          onNew={onNew}
          onUndo={onUndo}
          canUndo={history.length > 1}
          rotateEnabled={rotateEnabled}
          setRotateEnabled={setRotateEnabled}
          onResign={onResign}
          onOfferDraw={onOfferDraw}
        />
      </div>
    </div>
  );
}