import { Board, CellKey, Hex, Piece, key } from "./types";

export const BOARD_RADIUS = 5;

/** All 91 valid cells of Gliński's board. */
export const ALL_CELLS: Hex[] = (() => {
  const cells: Hex[] = [];
  for (let q = -BOARD_RADIUS; q <= BOARD_RADIUS; q++) {
    const rMin = Math.max(-BOARD_RADIUS, -BOARD_RADIUS - q);
    const rMax = Math.min(BOARD_RADIUS, BOARD_RADIUS - q);
    for (let r = rMin; r <= rMax; r++) cells.push({ q, r });
  }
  return cells;
})();

export const ALL_KEYS: CellKey[] = ALL_CELLS.map((c) => key(c.q, c.r));

export const isValid = (q: number, r: number): boolean =>
  Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= BOARD_RADIUS;

/** 3-coloring of the hex board (0,1,2). */
export const cellColor = (q: number, r: number): 0 | 1 | 2 => {
  const m = ((q - r) % 3 + 3) % 3;
  return m as 0 | 1 | 2;
};

/** 6 orthogonal hex directions (rook/king). */
export const HEX_DIRS: Hex[] = [
  { q: 1, r: 0 },
  { q: -1, r: 0 },
  { q: 0, r: 1 },
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: -1, r: 1 },
];

/** 6 diagonal hex directions (bishop/king). */
export const DIAG_DIRS: Hex[] = [
  { q: 1, r: 1 },
  { q: -1, r: -1 },
  { q: 2, r: -1 },
  { q: -2, r: 1 },
  { q: 1, r: -2 },
  { q: -1, r: 2 },
];

/** 12 knight jumps (one orthogonal step + one diagonal in outward direction). */
export const KNIGHT_JUMPS: Hex[] = [
  { q: 1, r: 2 },
  { q: -1, r: -2 },
  { q: 2, r: 1 },
  { q: -2, r: -1 },
  { q: 3, r: -1 },
  { q: -3, r: 1 },
  { q: 3, r: -2 },
  { q: -3, r: 2 },
  { q: 1, r: -3 },
  { q: -1, r: 3 },
  { q: 2, r: -3 },
  { q: -2, r: 3 },
];

/** Pawn forward step direction by color. */
export const PAWN_FWD = (c: "w" | "b"): Hex =>
  c === "w" ? { q: 0, r: 1 } : { q: 0, r: -1 };

/** Pawn capture cells: the two forward-oblique hex (rook) neighbors. */
export const PAWN_CAPS = (c: "w" | "b"): Hex[] =>
  c === "w"
    ? [
        { q: 1, r: 0 },
        { q: -1, r: 1 },
      ]
    : [
        { q: -1, r: 0 },
        { q: 1, r: -1 },
      ];


/** Initial Gliński setup. */
export function initialBoard(): Board {
  const b: Board = new Map();
  const place = (q: number, r: number, p: Piece) => b.set(key(q, r), p);

  // White back rank pieces (r = r_min for each file)
  // File q: rMin = max(-5, -5 - q)
  // White: c1(R), d1(N), e1(Q), f1(B), g1(K), h1(N), i1(R)
  //   plus f2(B), f3(B) extra bishops
  //   plus pawns: b1, c2, d3, e4, f5, g4, h3, i2, k1
  const white: [number, number, "K" | "Q" | "R" | "B" | "N" | "P"][] = [
    // Rooks: c1, i1
    [-3, -2, "R"],
    [3, -5, "R"],
    // Knights: d1, h1
    [-2, -3, "N"],
    [2, -5, "N"],
    // Queen: e1
    [-1, -4, "Q"],
    // King: g1
    [1, -5, "K"],
    // Bishops: f1, f2, f3 (center file q=0, r=-5,-4,-3)
    [0, -5, "B"],
    [0, -4, "B"],
    [0, -3, "B"],
    // Pawns: b1,c2,d3,e4,f5,g4,h3,i2,k1
    [-4, -1, "P"],
    [-3, -1, "P"],
    [-2, -1, "P"],
    [-1, -1, "P"],
    [0, -1, "P"],
    [1, -2, "P"],
    [2, -3, "P"],
    [3, -4, "P"],
    [4, -5, "P"],
  ];
  for (const [q, r, t] of white) place(q, r, { color: "w", type: t });
  // Black mirrors via central symmetry (q,r) -> (-q,-r), but King and Queen
  // are placed so they face their white counterparts on the same file
  // (Gliński's convention).
  for (const [q, r, t] of white) {
    if (t === "K" || t === "Q") {
      // Same file as white counterpart, on black's back rank
      const rMax = Math.min(BOARD_RADIUS, BOARD_RADIUS - q);
      place(q, rMax, { color: "b", type: t });
    } else {
      place(-q, -r, { color: "b", type: t });
    }
  }

  return b;
}

/** File letter (a..l skipping j) for column q. */
export function fileLetter(q: number): string {
  const letters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l"];
  return letters[q + BOARD_RADIUS];
}

/** Rank number (1-based, white at bottom) for cell (q,r). */
export function rankNumber(q: number, r: number): number {
  const rMin = Math.max(-BOARD_RADIUS, -BOARD_RADIUS - q);
  return r - rMin + 1;
}

export function notation(q: number, r: number): string {
  return `${fileLetter(q)}${rankNumber(q, r)}`;
}

/** Last rank for color (for pawn promotion). */
export function isLastRank(color: "w" | "b", q: number, r: number): boolean {
  const rMin = Math.max(-BOARD_RADIUS, -BOARD_RADIUS - q);
  const rMax = Math.min(BOARD_RADIUS, BOARD_RADIUS - q);
  return color === "w" ? r === rMax : r === rMin;
}