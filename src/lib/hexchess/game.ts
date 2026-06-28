import { initialBoard, notation } from "./board";
import { applyMove, hasAnyLegalMove, inCheck, legalMoves } from "./moves";
import { Board, CellKey, Color, Move, Piece } from "./types";


export interface HistoryEntry {
  move: Move;
  san: string;
  check: boolean;
  mate: boolean;
}

export type GameStatus =
  | "active"
  | "checkmate"
  | "stalemate"
  | "draw-repetition"
  | "draw-agreement"
  | "resigned";

export interface GameState {
  board: Board;
  turn: Color;
  history: HistoryEntry[];
  captured: { w: Piece[]; b: Piece[] };
  status: GameStatus;
  winner?: Color;
  /** Square eligible for en passant capture this turn (set after a pawn double-step). */
  enPassantTarget: CellKey | null;
  /** How many times each position+turn+ep has occurred. */
  positionCounts: Record<string, number>;
}

function positionKey(board: Board, turn: Color, ep: CellKey | null): string {
  const entries: string[] = [];
  for (const [k, p] of board) entries.push(`${k}:${p.color}${p.type}`);
  entries.sort();
  return `${turn}|${ep ?? "-"}|${entries.join(";")}`;
}

export function newGame(): GameState {
  const board = initialBoard();
  const counts: Record<string, number> = {};
  counts[positionKey(board, "w", null)] = 1;
  return {
    board,
    turn: "w",
    history: [],
    captured: { w: [], b: [] },
    status: "active",
    enPassantTarget: null,
    positionCounts: counts,
  };
}

/** Start a game from a custom position (for presets). */
export function newGameFromBoard(board: Board, turn: Color = "w"): GameState {
  const counts: Record<string, number> = {};
  counts[positionKey(board, turn, null)] = 1;
  return {
    board: new Map(board),
    turn,
    history: [],
    captured: { w: [], b: [] },
    status: "active",
    enPassantTarget: null,
    positionCounts: counts,
  };
}

export function getLegalMoves(s: GameState, from: CellKey): Move[] {
  const p = s.board.get(from);
  if (!p || p.color !== s.turn) return [];
  return legalMoves(s.board, from, s.enPassantTarget);
}

export function makeMove(s: GameState, m: Move): GameState {
  if (s.status !== "active") return s;
  const newBoard = applyMove(s.board, m);
  const nextTurn: Color = s.turn === "w" ? "b" : "w";
  const nextEp: CellKey | null = m.doubleStepSkipped ?? null;
  const isCheck = inCheck(newBoard, nextTurn);
  const hasMove = hasAnyLegalMove(newBoard, nextTurn, nextEp);
  const isMate = !hasMove && isCheck;
  const isStale = !hasMove && !isCheck;

  const captured = {
    w: [...s.captured.w],
    b: [...s.captured.b],
  };
  if (m.captured) captured[s.turn].push(m.captured);

  const san = toSAN(m, isCheck, isMate);

  const counts = { ...s.positionCounts };
  const pkey = positionKey(newBoard, nextTurn, nextEp);
  counts[pkey] = (counts[pkey] ?? 0) + 1;
  const repeated = counts[pkey] >= 3;

  let status: GameStatus = "active";
  let winner: Color | undefined;
  if (isMate) {
    status = "checkmate";
    winner = s.turn;
  } else if (isStale) {
    status = "stalemate";
  } else if (repeated) {
    status = "draw-repetition";
  }

  return {
    board: newBoard,
    turn: nextTurn,
    history: [...s.history, { move: m, san, check: isCheck, mate: isMate }],
    captured,
    status,
    winner,
    enPassantTarget: nextEp,
    positionCounts: counts,
  };
}

export function resign(s: GameState, color: Color): GameState {
  if (s.status !== "active") return s;
  return { ...s, status: "resigned", winner: color === "w" ? "b" : "w" };
}

export function agreeDraw(s: GameState): GameState {
  if (s.status !== "active") return s;
  return { ...s, status: "draw-agreement" };
}

function toSAN(m: Move, check: boolean, mate: boolean): string {
  const piece = m.piece.type === "P" ? "" : m.piece.type;
  const cap = m.captured ? "x" : "-";
  const { q: q1, r: r1 } = parseKey(m.from);
  const { q: q2, r: r2 } = parseKey(m.to);
  const prom = m.promotion ? `=${m.promotion}` : "";
  const ep = m.enPassant ? " e.p." : "";
  const suffix = mate ? "#" : check ? "+" : "";
  return `${piece}${notation(q1, r1)}${cap}${notation(q2, r2)}${prom}${ep}${suffix}`;
}

function parseKey(k: CellKey) {
  const [q, r] = k.split(",").map(Number);
  return { q, r };
}