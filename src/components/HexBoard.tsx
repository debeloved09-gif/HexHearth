import { useMemo, useState, useEffect } from "react";
import {
  ALL_CELLS,
  BOARD_RADIUS,
  cellColor,
  notation,
} from "@/lib/hexchess/board";
import { CellKey, Color, Move, Piece } from "@/lib/hexchess/types";
import { GameState, getLegalMoves } from "@/lib/hexchess/game";
import { findKing, inCheck } from "@/lib/hexchess/moves";

const HEX_SIZE = 38; // flat-top hex "radius" (center to corner)

// Flat-top hex axial -> pixel. Negate y so increasing rank (white→black) goes UP.
function hexToPixel(q: number, r: number) {
  const x = HEX_SIZE * 1.5 * q;
  const y = -HEX_SIZE * Math.sqrt(3) * (r + q / 2);
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
  wK, wQ, wR, wB, wN, wP,
  bK, bQ, bR, bB, bN, bP,
};


interface Props {
  state: GameState;
  onMove: (m: Move) => void;
  rotation: number; // 0 or 180
}

export function HexBoard({ state, onMove, rotation }: Props) {
  const [selected, setSelected] = useState<CellKey | null>(null);
  const [pending, setPending] = useState<Move[] | null>(null); // promotion choice

  // Clear selection when turn changes
  useEffect(() => {
    setSelected(null);
    setPending(null);
  }, [state.history.length]);

  const dims = useMemo(() => {
    const positions = ALL_CELLS.map((c) => hexToPixel(c.q, c.r));
    const xs = positions.map((p) => p.x);
    const ys = positions.map((p) => p.y);
    const pad = HEX_SIZE + 18;
    const minX = Math.min(...xs) - pad;
    const maxX = Math.max(...xs) + pad;
    const minY = Math.min(...ys) - pad;
    const maxY = Math.max(...ys) + pad;
    return { minX, minY, w: maxX - minX, h: maxY - minY };
  }, []);

  const legal = selected ? getLegalMoves(state, selected) : [];
  const legalTos = new Set(legal.map((m) => m.to));

  const lastMove = state.history.at(-1)?.move;
  const kingInCheckKey =
    state.status === "active" && inCheck(state.board, state.turn)
      ? findKing(state.board, state.turn)
      : null;

  const handleClick = (k: CellKey) => {
    if (pending) return;
    if (state.status !== "active") return;
    const piece = state.board.get(k);
    if (selected && legalTos.has(k)) {
      const moves = legal.filter((m) => m.to === k);
      if (moves.length > 1 && moves[0].promotion) {
        setPending(moves);
        return;
      }
      onMove(moves[0]);
      setSelected(null);
      return;
    }
    if (piece && piece.color === state.turn) {
      setSelected(k);
    } else {
      setSelected(null);
    }
  };

  const fillFor = (cIdx: 0 | 1 | 2) =>
    cIdx === 0
      ? "var(--hex-light)"
      : cIdx === 1
        ? "var(--hex-mid)"
        : "var(--hex-dark)";

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox={`${dims.minX} ${dims.minY} ${dims.w} ${dims.h}`}
        className="w-full h-full max-h-[88vh] select-none"
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        {ALL_CELLS.map(({ q, r }) => {
          const k = `${q},${r}`;
          const { x, y } = hexToPixel(q, r);
          const cIdx = cellColor(q, r);
          const piece = state.board.get(k);
          const isSel = selected === k;
          const isLegal = legalTos.has(k);
          const isLast = lastMove && (lastMove.from === k || lastMove.to === k);
          const isCheck = kingInCheckKey === k;
          const showCap = isLegal && piece;
          return (
            <g
              key={k}
              onClick={() => handleClick(k)}
              style={{ cursor: "pointer" }}
            >
              <polygon
                points={hexPoints(x, y, HEX_SIZE)}
                fill={fillFor(cIdx)}
                stroke="var(--hex-stroke)"
                strokeWidth={0.6}
              />
              {isCheck && (
                <polygon
                  points={hexPoints(x, y, HEX_SIZE)}
                  fill="var(--hex-check)"
                  opacity={0.45}
                />
              )}
              {isLast && (
                <polygon
                  points={hexPoints(x, y, HEX_SIZE)}
                  fill="var(--hex-last)"
                />
              )}
              {isSel && (
                <polygon
                  points={hexPoints(x, y, HEX_SIZE)}
                  fill="var(--hex-selected)"
                  opacity={0.55}
                />
              )}
              {/* Coordinate labels (small) */}
              {(r ===
                Math.max(-BOARD_RADIUS, -BOARD_RADIUS - q) ||
                q === -BOARD_RADIUS ||
                q === BOARD_RADIUS) && (
                <text
                  x={x}
                  y={y + HEX_SIZE - 6}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--hex-stroke)"
                  style={{
                    transform: `rotate(${-rotation}deg)`,
                    transformOrigin: `${x}px ${y}px`,
                    pointerEvents: "none",
                  }}
                  opacity={0.7}
                >
                  {notation(q, r)}
                </text>
              )}
              {piece && (
                <PieceGlyph
                  piece={piece}
                  cx={x}
                  cy={y}
                  rotation={rotation}
                />
              )}
              {isLegal && !showCap && (
                <circle
                  cx={x}
                  cy={y}
                  r={HEX_SIZE * 0.22}
                  fill="var(--hex-legal)"
                  pointerEvents="none"
                />
              )}
              {showCap && (
                <circle
                  cx={x}
                  cy={y}
                  r={HEX_SIZE * 0.92}
                  fill="none"
                  stroke="var(--hex-legal)"
                  strokeWidth={4}
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}
      </svg>

      {pending && (
        <PromotionDialog
          moves={pending}
          onPick={(m) => {
            onMove(m);
            setPending(null);
            setSelected(null);
          }}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}

function PieceGlyph({
  piece,
  cx,
  cy,
  rotation,
}: {
  piece: Piece;
  cx: number;
  cy: number;
  rotation: number;
}) {
  const src = PIECE_IMG[`${piece.color}${piece.type}`];
  const size = HEX_SIZE * 1.55;
  const name = `${piece.color === "w" ? "White" : "Black"} ${
    { P: "Pawn", N: "Knight", B: "Bishop", R: "Rook", Q: "Queen", K: "King" }[piece.type]
  }`;
  return (
    <image
      href={src}
      x={cx - size / 2}
      y={cy - size / 2}
      width={size}
      height={size}
      preserveAspectRatio="xMidYMid meet"
      aria-label={name}
      role="img"
      style={{
        transform: `rotate(${-rotation}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
        transition: "transform 700ms cubic-bezier(0.22,1,0.36,1)",
        pointerEvents: "none",
        filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))",
      }}
    >
      <title>{name}</title>
    </image>
  );
}


function PromotionDialog({
  moves,
  onPick,
  onCancel,
}: {
  moves: Move[];
  onPick: (m: Move) => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm z-10"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-xl p-4 shadow-2xl flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {moves.map((m) => (
          <button
            key={m.promotion}
            className="w-16 h-16 rounded-lg bg-secondary hover:bg-accent transition-colors flex items-center justify-center p-1"
            onClick={() => onPick(m)}
          >
            <img
              src={PIECE_IMG[`${m.piece.color}${m.promotion}`]}
              alt={`Promote to ${m.piece.color === "w" ? "White" : "Black"} ${
                { Q: "Queen", R: "Rook", B: "Bishop", N: "Knight" }[m.promotion as "Q"|"R"|"B"|"N"]
              }`}
              className="w-full h-full object-contain"
            />
          </button>

        ))}
      </div>
    </div>
  );
}