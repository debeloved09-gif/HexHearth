export type Color = "w" | "b";
export type PieceType = "K" | "Q" | "R" | "B" | "N" | "P";

export interface Piece {
  color: Color;
  type: PieceType;
}

/** Cube/axial hex coordinate. q + r + s = 0; we store q,r and derive s. */
export interface Hex {
  q: number;
  r: number;
}

export type CellKey = string; // "q,r"

export const key = (q: number, r: number): CellKey => `${q},${r}`;
export const fromKey = (k: CellKey): Hex => {
  const [q, r] = k.split(",").map(Number);
  return { q, r };
};

export interface Move {
  from: CellKey;
  to: CellKey;
  piece: Piece;
  captured?: Piece;
  /** For en passant, the actual square the captured pawn is on (differs from `to`). */
  capturedFrom?: CellKey;
  promotion?: PieceType;
  enPassant?: boolean;
  /** Pawn double-step: the skipped square, which becomes the next ep target. */
  doubleStepSkipped?: CellKey;
}

export type Board = Map<CellKey, Piece>;