import { GameState } from "@/lib/hexchess/game";
import { Piece } from "@/lib/hexchess/types";
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

const VALUE: Record<string, number> = { P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0 };
const PIECE_NAME: Record<string, string> = { P: "Pawn", N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" };
export { PIECE_NAME };


function material(pieces: Piece[]) {
  return pieces.reduce((s, p) => s + VALUE[p.type], 0);
}

export function GamePanel({
  state,
  onNew,
  onUndo,
  canUndo,
  rotateEnabled,
  setRotateEnabled,
  onResign,
  onOfferDraw,
}: {
  state: GameState;
  onNew: () => void;
  onUndo: () => void;
  canUndo: boolean;
  rotateEnabled: boolean;
  setRotateEnabled: (v: boolean) => void;
  onResign: (color: "w" | "b") => void;
  onOfferDraw: () => void;
}) {
  const whiteCaps = state.captured.w; // captured by white = black pieces
  const blackCaps = state.captured.b;
  const wMat = material(whiteCaps);
  const bMat = material(blackCaps);
  const diff = wMat - bMat;

  return (
    <aside className="w-full md:w-80 flex flex-col gap-4 p-4 bg-card border border-border rounded-2xl shadow-xl">
      <header>
        <h1 className="text-xl font-bold tracking-tight">
          HexHearth — Gliński's Hexagonal Chess
        </h1>
        <p className="text-xs text-muted-foreground">
          Gliński's variant · 91 hexes · Pass & Play
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2">
        <PlayerCard
          name="Black"
          active={state.turn === "b"}
          captured={blackCaps}
          advantage={diff < 0 ? -diff : 0}
        />
        <PlayerCard
          name="White"
          active={state.turn === "w"}
          captured={whiteCaps}
          advantage={diff > 0 ? diff : 0}
        />
      </div>

      <StatusBanner state={state} />

      <div className="flex gap-2">
        <button
          onClick={onNew}
          className="flex-1 px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
        >
          New game
        </button>
        <button
          onClick={onUndo}
          disabled={!canUndo || state.status !== "active"}
          className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Undo
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onOfferDraw}
          disabled={state.status !== "active"}
          className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium hover:bg-muted transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Agree to a draw"
        >
          Draw
        </button>
        <button
          onClick={() => onResign(state.turn)}
          disabled={state.status !== "active"}
          className="flex-1 px-3 py-2 rounded-lg bg-destructive/80 text-destructive-foreground font-medium hover:bg-destructive transition disabled:opacity-40 disabled:cursor-not-allowed"
          title="Forfeit the current turn's side"
        >
          Forfeit
        </button>

      </div>

      <label className="flex items-center justify-between text-sm px-1">
        <span id="auto-rotate-label">Auto-rotate board</span>
        <button
          role="switch"
          aria-checked={rotateEnabled}
          aria-labelledby="auto-rotate-label"
          aria-label="Auto-rotate board"
          onClick={() => setRotateEnabled(!rotateEnabled)}
          className={`w-10 h-6 rounded-full transition-colors ${
            rotateEnabled ? "bg-primary" : "bg-muted"
          } relative`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-background transition-transform ${
              rotateEnabled ? "translate-x-4" : ""
            }`}
          />
        </button>
      </label>

      <div className="flex-1 min-h-0">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-1">
          Moves
        </h2>
        <div className="bg-background/40 rounded-lg p-2 h-56 overflow-y-auto font-mono text-sm">
          {state.history.length === 0 && (
            <p className="text-muted-foreground text-xs italic px-1">
              No moves yet.
            </p>
          )}
          <ol className="space-y-0.5">
            {pairs(state.history.map((h) => h.san)).map((pair, i) => (
              <li key={i} className="flex gap-2 px-1">
                <span className="text-muted-foreground w-6">{i + 1}.</span>
                <span className="flex-1">{pair[0]}</span>
                <span className="flex-1">{pair[1] ?? ""}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </aside>
  );
}

function pairs<T>(arr: T[]): [T, T?][] {
  const out: [T, T?][] = [];
  for (let i = 0; i < arr.length; i += 2)
    out.push([arr[i], arr[i + 1]] as [T, T?]);
  return out;
}

function PlayerCard({
  name,
  active,
  captured,
  advantage,
}: {
  name: string;
  active: boolean;
  captured: Piece[];
  advantage: number;
}) {
  return (
    <div
      className={`p-3 rounded-xl border transition-all ${
        active
          ? "border-primary bg-primary/10 shadow-[0_0_0_1px_var(--primary)]"
          : "border-border bg-background/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold">{name}</span>
        {active && (
          <span className="text-[10px] uppercase tracking-wider text-primary font-bold">
            ● turn
          </span>
        )}
      </div>
      <div className="mt-1 min-h-6 flex flex-wrap gap-0.5 items-end">
        {captured.map((p, i) => (
          <img
            key={i}
            src={PIECE_IMG[`${p.color}${p.type}`]}
            alt={`${p.color === "w" ? "White" : "Black"} ${PIECE_NAME[p.type]}`}
            className="w-4 h-4 object-contain"
          />
        ))}
        {advantage > 0 && (
          <span className="ml-1 text-xs text-muted-foreground">
            +{advantage}
          </span>
        )}
      </div>

    </div>
  );
}

function StatusBanner({ state }: { state: GameState }) {
  if (state.status === "checkmate") {
    return (
      <div className="p-3 rounded-lg bg-primary/15 border border-primary text-center animate-fade-in">
        <p className="font-bold text-primary">Checkmate</p>
        <p className="text-sm">{state.winner === "w" ? "White" : "Black"} wins</p>
      </div>
    );
  }
  if (state.status === "resigned") {
    return (
      <div className="p-3 rounded-lg bg-destructive/15 border border-destructive text-center animate-fade-in">
        <p className="font-bold text-destructive">Forfeit</p>
        <p className="text-sm">{state.winner === "w" ? "White" : "Black"} wins by resignation</p>
      </div>
    );
  }
  if (state.status === "stalemate") {
    return (
      <div className="p-3 rounded-lg bg-muted border border-border text-center animate-fade-in">
        <p className="font-bold">Stalemate</p>
        <p className="text-sm text-muted-foreground">Draw — no legal moves</p>
      </div>
    );
  }
  if (state.status === "draw-repetition") {
    return (
      <div className="p-3 rounded-lg bg-muted border border-border text-center animate-fade-in">
        <p className="font-bold">Draw</p>
        <p className="text-sm text-muted-foreground">Threefold repetition</p>
      </div>
    );
  }
  if (state.status === "draw-agreement") {
    return (
      <div className="p-3 rounded-lg bg-muted border border-border text-center animate-fade-in">
        <p className="font-bold">Draw</p>
        <p className="text-sm text-muted-foreground">By agreement</p>
      </div>
    );
  }
  const last = state.history.at(-1);
  if (last?.check) {
    return (
      <div className="p-2 rounded-lg bg-destructive/15 border border-destructive/40 text-center text-sm">
        Check!
      </div>
    );
  }
  return null;
}
