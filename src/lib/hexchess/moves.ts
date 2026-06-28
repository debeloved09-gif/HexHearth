import {
  DIAG_DIRS,
  HEX_DIRS,
  KNIGHT_JUMPS,
  PAWN_CAPS,
  PAWN_FWD,
  isLastRank,
  isValid,
} from "./board";
import { Board, CellKey, Color, Move, Piece, fromKey, key } from "./types";

function slide(
  board: Board,
  from: CellKey,
  piece: Piece,
  dirs: { q: number; r: number }[],
): Move[] {
  const out: Move[] = [];
  const { q: q0, r: r0 } = fromKey(from);
  for (const d of dirs) {
    let q = q0 + d.q;
    let r = r0 + d.r;
    while (isValid(q, r)) {
      const k = key(q, r);
      const target = board.get(k);
      if (!target) {
        out.push({ from, to: k, piece });
      } else {
        if (target.color !== piece.color)
          out.push({ from, to: k, piece, captured: target });
        break;
      }
      q += d.q;
      r += d.r;
    }
  }
  return out;
}

function step(
  board: Board,
  from: CellKey,
  piece: Piece,
  jumps: { q: number; r: number }[],
): Move[] {
  const out: Move[] = [];
  const { q: q0, r: r0 } = fromKey(from);
  for (const d of jumps) {
    const q = q0 + d.q;
    const r = r0 + d.r;
    if (!isValid(q, r)) continue;
    const k = key(q, r);
    const t = board.get(k);
    if (!t) out.push({ from, to: k, piece });
    else if (t.color !== piece.color)
      out.push({ from, to: k, piece, captured: t });
  }
  return out;
}

function pawnMoves(
  board: Board,
  from: CellKey,
  piece: Piece,
  enPassantTarget?: CellKey | null,
): Move[] {
  const out: Move[] = [];
  const { q: q0, r: r0 } = fromKey(from);
  const fwd = PAWN_FWD(piece.color);
  const f = { q: q0 + fwd.q, r: r0 + fwd.r };
  if (isValid(f.q, f.r) && !board.has(key(f.q, f.r))) {
    pushPawn(out, from, key(f.q, f.r), piece);
    // Optional double-step from starting cells
    if (isPawnStart(piece.color, q0, r0)) {
      const f2 = { q: f.q + fwd.q, r: f.r + fwd.r };
      if (isValid(f2.q, f2.r) && !board.has(key(f2.q, f2.r))) {
        out.push({
          from,
          to: key(f2.q, f2.r),
          piece,
          doubleStepSkipped: key(f.q, f.r),
        });
      }
    }
  }
  for (const d of PAWN_CAPS(piece.color)) {
    const q = q0 + d.q;
    const r = r0 + d.r;
    if (!isValid(q, r)) continue;
    const toK = key(q, r);
    const t = board.get(toK);
    if (t && t.color !== piece.color) {
      pushPawn(out, from, toK, piece, t);
    } else if (!t && enPassantTarget && enPassantTarget === toK) {
      // En passant: enemy pawn sits one step behind the target square.
      const capQ = q - fwd.q;
      const capR = r - fwd.r;
      const capK = key(capQ, capR);
      const ep = board.get(capK);
      if (ep && ep.color !== piece.color && ep.type === "P") {
        out.push({
          from,
          to: toK,
          piece,
          captured: ep,
          capturedFrom: capK,
          enPassant: true,
        });
      }
    }
  }
  return out;
}

function pushPawn(
  out: Move[],
  from: CellKey,
  to: CellKey,
  piece: Piece,
  captured?: Piece,
) {
  const { q, r } = fromKey(to);
  if (isLastRank(piece.color, q, r)) {
    for (const t of ["Q", "R", "B", "N"] as const) {
      out.push({ from, to, piece, captured, promotion: t });
    }
  } else {
    out.push({ from, to, piece, captured });
  }
}

function isPawnStart(color: Color, q: number, r: number): boolean {
  // Gliński: a pawn may double-move from any pawn-initial cell —
  // its own starting cells, OR an opponent pawn-initial cell it reached by capture.
  const whites: [number, number][] = [
    [-4, -1],
    [-3, -1],
    [-2, -1],
    [-1, -1],
    [0, -1],
    [1, -2],
    [2, -3],
    [3, -4],
    [4, -5],
  ];
  if (whites.some(([a, b]) => a === q && b === r)) return true;
  // Black mirror
  return whites.some(([a, b]) => -a === q && -b === r);
}


export function pseudoMoves(
  board: Board,
  from: CellKey,
  enPassantTarget?: CellKey | null,
): Move[] {
  const p = board.get(from);
  if (!p) return [];
  switch (p.type) {
    case "R":
      return slide(board, from, p, HEX_DIRS);
    case "B":
      return slide(board, from, p, DIAG_DIRS);
    case "Q":
      return [...slide(board, from, p, HEX_DIRS), ...slide(board, from, p, DIAG_DIRS)];
    case "K":
      return step(board, from, p, [...HEX_DIRS, ...DIAG_DIRS]);
    case "N":
      return step(board, from, p, KNIGHT_JUMPS);
    case "P":
      return pawnMoves(board, from, p, enPassantTarget);
  }
}

export function applyMove(board: Board, m: Move): Board {
  const b = new Map(board);
  b.delete(m.from);
  if (m.enPassant && m.capturedFrom) b.delete(m.capturedFrom);
  b.set(m.to, m.promotion ? { color: m.piece.color, type: m.promotion } : m.piece);
  return b;
}

export function findKing(board: Board, color: Color): CellKey | null {
  for (const [k, p] of board)
    if (p.type === "K" && p.color === color) return k;
  return null;
}

/**
 * Fast attack test: scan outward from `target` and look for an enemy piece
 * of the appropriate type. O(directions) instead of O(pieces × rays).
 */
export function isSquareAttacked(
  board: Board,
  target: CellKey,
  by: Color,
): boolean {
  const { q: tq, r: tr } = fromKey(target);

  // Sliding orthogonal rays: rook, queen; adjacent king
  for (const d of HEX_DIRS) {
    let q = tq + d.q;
    let r = tr + d.r;
    let step = 1;
    while (isValid(q, r)) {
      const p = board.get(key(q, r));
      if (p) {
        if (p.color === by) {
          if (p.type === "R" || p.type === "Q") return true;
          if (step === 1 && p.type === "K") return true;
        }
        break;
      }
      q += d.q;
      r += d.r;
      step++;
    }
  }

  // Sliding diagonal rays: bishop, queen; adjacent king
  for (const d of DIAG_DIRS) {
    let q = tq + d.q;
    let r = tr + d.r;
    let step = 1;
    while (isValid(q, r)) {
      const p = board.get(key(q, r));
      if (p) {
        if (p.color === by) {
          if (p.type === "B" || p.type === "Q") return true;
          if (step === 1 && p.type === "K") return true;
        }
        break;
      }
      q += d.q;
      r += d.r;
      step++;
    }
  }

  // Knights
  for (const j of KNIGHT_JUMPS) {
    const q = tq + j.q;
    const r = tr + j.r;
    if (!isValid(q, r)) continue;
    const p = board.get(key(q, r));
    if (p && p.color === by && p.type === "N") return true;
  }

  // Pawns: an enemy pawn attacks `target` if it sits at target minus one of
  // its capture vectors.
  for (const c of PAWN_CAPS(by)) {
    const q = tq - c.q;
    const r = tr - c.r;
    if (!isValid(q, r)) continue;
    const p = board.get(key(q, r));
    if (p && p.color === by && p.type === "P") return true;
  }

  return false;
}

export function inCheck(board: Board, color: Color): boolean {
  const k = findKing(board, color);
  if (!k) return false;
  return isSquareAttacked(board, k, color === "w" ? "b" : "w");
}

/** Apply a move in place, returning the previous occupant of `to` (for revert). */
function applyInPlace(
  board: Board,
  m: Move,
): { prev: Piece | undefined; epPrev: Piece | undefined } {
  const prev = board.get(m.to);
  let epPrev: Piece | undefined;
  if (m.enPassant && m.capturedFrom) {
    epPrev = board.get(m.capturedFrom);
    board.delete(m.capturedFrom);
  }
  board.delete(m.from);
  board.set(m.to, m.promotion ? { color: m.piece.color, type: m.promotion } : m.piece);
  return { prev, epPrev };
}

function revertInPlace(
  board: Board,
  m: Move,
  prev: Piece | undefined,
  epPrev: Piece | undefined,
) {
  board.delete(m.to);
  if (prev) board.set(m.to, prev);
  board.set(m.from, m.piece);
  if (m.enPassant && m.capturedFrom && epPrev) board.set(m.capturedFrom, epPrev);
}

export function legalMoves(
  board: Board,
  from: CellKey,
  enPassantTarget?: CellKey | null,
): Move[] {
  const p = board.get(from);
  if (!p) return [];
  const out: Move[] = [];
  for (const m of pseudoMoves(board, from, enPassantTarget)) {
    const { prev, epPrev } = applyInPlace(board, m);
    const ok = !inCheck(board, p.color);
    revertInPlace(board, m, prev, epPrev);
    if (ok) out.push(m);
  }
  return out;
}

export function allLegalMoves(
  board: Board,
  color: Color,
  enPassantTarget?: CellKey | null,
): Move[] {
  const out: Move[] = [];
  const keys: CellKey[] = [];
  for (const [k, p] of board) if (p.color === color) keys.push(k);
  for (const k of keys) out.push(...legalMoves(board, k, enPassantTarget));
  return out;
}

/**
 * Fast check: does `color` have any legal move? Tries cheapest pieces first
 * (king, knight) to short-circuit near mate/stalemate where most moves are illegal.
 */
export function hasAnyLegalMove(
  board: Board,
  color: Color,
  enPassantTarget?: CellKey | null,
): boolean {
  // CRITICAL: snapshot entries before iterating — `applyInPlace` mutates the
  // same Map (inserts m.to, deletes m.from). Iterating a live Map while
  // mutating it can revisit/skip entries and, in pathological cases (e.g.
  // near checkmate), can effectively hang the main thread.
  const entries: [CellKey, Piece][] = [];
  for (const [k, p] of board) if (p.color === color) entries.push([k, p]);
  const order: PieceTypeOrder[] = ["K", "N", "P", "B", "R", "Q"];
  for (const type of order) {
    for (const [k, p] of entries) {
      if (p.type !== type) continue;
      // Re-fetch live piece (board may have been restored but identity matches)
      if (board.get(k) !== p) continue;
      const moves = pseudoMoves(board, k, enPassantTarget);
      for (const m of moves) {
        const { prev, epPrev } = applyInPlace(board, m);
        const ok = !inCheck(board, color);
        revertInPlace(board, m, prev, epPrev);
        if (ok) return true;
      }
    }
  }
  return false;
}

type PieceTypeOrder = "K" | "N" | "P" | "B" | "R" | "Q";