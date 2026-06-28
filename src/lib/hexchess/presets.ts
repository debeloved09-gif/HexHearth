import { Board, Color, PieceType, key } from "./types";

type Spec = [number, number, Color, PieceType];

function build(spec: Spec[]): Board {
  const b: Board = new Map();
  for (const [q, r, c, t] of spec) b.set(key(q, r), { color: c, type: t });
  return b;
}

function withMods(
  base: Spec[],
  remove: Array<[number, number]>,
  add: Spec[],
): Spec[] {
  const removed = new Set(remove.map(([q, r]) => `${q},${r}`));
  return [
    ...base.filter(([q, r]) => !removed.has(`${q},${r}`)),
    ...add,
  ];
}

/** Full Gliński starting position as a Spec list (mirror of board.ts). */
const initialSpec: Spec[] = [
  // White pieces
  [-3, -2, "w", "R"], [3, -5, "w", "R"],
  [-2, -3, "w", "N"], [2, -5, "w", "N"],
  [-1, -4, "w", "Q"],
  [1, -5, "w", "K"],
  [0, -5, "w", "B"], [0, -4, "w", "B"], [0, -3, "w", "B"],
  // White pawns: b1..k1 chevron
  [-4, -1, "w", "P"], [-3, -1, "w", "P"], [-2, -1, "w", "P"], [-1, -1, "w", "P"],
  [0, -1, "w", "P"], [1, -2, "w", "P"], [2, -3, "w", "P"], [3, -4, "w", "P"], [4, -5, "w", "P"],
  // Black pieces (mirror; K & Q stay on the e/g files)
  [3, 2, "b", "R"], [-3, 5, "b", "R"],
  [2, 3, "b", "N"], [-2, 5, "b", "N"],
  [-1, 5, "b", "Q"],
  [1, 4, "b", "K"],
  [0, 5, "b", "B"], [0, 4, "b", "B"], [0, 3, "b", "B"],
  // Black pawns
  [4, 1, "b", "P"], [3, 1, "b", "P"], [2, 1, "b", "P"], [1, 1, "b", "P"],
  [0, 1, "b", "P"], [-1, 2, "b", "P"], [-2, 3, "b", "P"], [-3, 4, "b", "P"], [-4, 5, "b", "P"],
];

export type Phase = "Opening" | "Middlegame" | "Endgame";

export interface Preset {
  id: string;
  name: string;
  phase: Phase;
  turn: Color;
  tagline: string;
  description: string;
  board: Board;
}

/* --------------------------------------------------------------------- *
 *  THE PRESETS                                                          *
 * --------------------------------------------------------------------- */

// 1. Opening — both sides have advanced their central e-pawn one step.
const dawnsFirstLight: Preset = {
  id: "dawns-first-light",
  name: "Dawn's First Light",
  phase: "Opening",
  turn: "w",
  tagline: "First pawns of the morning march.",
  description:
    "Both armies open with a single step of the central pawn — the simplest, most ancient invitation to battle. Every line is still open and every piece sleeps in its barracks.",
  board: build(
    withMods(
      initialSpec,
      [[-1, -1], [-1, 2]],
      [[-1, 0, "w", "P"], [-1, 1, "b", "P"]],
    ),
  ),
};

// 2. Opening / early dev — Iron Phalanx: pawns linked, knights stepping out.
const ironPhalanx: Preset = {
  id: "iron-phalanx",
  name: "The Iron Phalanx",
  phase: "Opening",
  turn: "b",
  tagline: "Connected pawns and outriding knights.",
  description:
    "White has braced the centre with linked e- and g-pawns and sent a knight to the front; Black mirrors the wall. A study in pawn solidarity — break the chain and the kingdom totters.",
  board: build(
    withMods(
      initialSpec,
      [[-1, -1], [1, -2], [-2, -3], [-1, 2], [1, 1], [2, 3]],
      [
        [-1, 0, "w", "P"], [1, -1, "w", "P"], [0, -2, "w", "N"],
        [-1, 1, "b", "P"], [1, 0, "b", "P"], [0, 2, "b", "N"],
      ],
    ),
  ),
};

// 3. Middlegame — knights and bishops developed, queens beginning to roam.
const twinLances: Preset = {
  id: "twin-lances",
  name: "Twin Lances",
  phase: "Middlegame",
  turn: "w",
  tagline: "Knights ride out, the queens awake.",
  description:
    "All four knights have leapt into the field, both queens have stepped a square forward, and the centre is contested. The position bristles with tactical sparks.",
  board: build(
    withMods(
      initialSpec,
      [
        [-1, -1], [-2, -3], [2, -5], [-1, -4],
        [-1, 2], [-2, 5], [2, 3], [-1, 5],
      ],
      [
        [-1, 0, "w", "P"],
        [0, -2, "w", "N"],
        [-1, -3, "w", "N"],
        [-1, -2, "w", "Q"],
        [-1, 1, "b", "P"],
        [0, 2, "b", "N"],
        [-1, 4, "b", "N"],
        [-1, 3, "b", "Q"],
      ],
    ),
  ),
};

// 4. Endgame — King + Rook + pawn vs King + pawn. Rook-mate technique.
const sunkenTower: Preset = {
  id: "sunken-tower",
  name: "The Sunken Tower",
  phase: "Endgame",
  turn: "w",
  tagline: "A lone rook hunts a wandering king.",
  description:
    "The armies have spent themselves. White's rook and king must corner Black's monarch before the lone pawns become a threat — a textbook lesson in herding a king to the edge.",
  board: build([
    [1, -3, "w", "K"],
    [0, 1, "w", "R"],
    [-1, 0, "w", "P"],
    [1, 3, "b", "K"],
    [-1, 3, "b", "P"],
  ]),
};

// 5. Endgame — Queen + King vs King + pawn. The kill is close.
const lastVigil: Preset = {
  id: "last-vigil",
  name: "The Last Vigil",
  phase: "Endgame",
  turn: "w",
  tagline: "One queen, one king, one final breath.",
  description:
    "Black's army is gone. White's queen circles for the mating net while a stubborn pawn keeps marching. Find the precise square and the long game ends in a heartbeat.",
  board: build([
    [1, -4, "w", "K"],
    [0, 3, "w", "Q"],
    [3, 1, "b", "K"],
    [4, 0, "b", "P"],
  ]),
};

const solarForge: Preset = {
  id: "solar-forge",
  name: "Solar Forge",
  phase: "Opening",
  turn: "w",
  tagline: "A heated opening on the centre files.",
  description:
    "White has pushed the central pawn while knights and queens jockey for control of the forge. Black answers with mirrored pressure on the flanks, making every capture feel like molten metal striking steel.",
  board: build(
    withMods(
      initialSpec,
      [[0, -1], [2, -5], [0, 1], [2, 1]],
      [[0, 0, "w", "P"], [2, -4, "w", "N"], [0, 2, "b", "P"], [2, 0, "b", "N"]],
    ),
  ),
};

const nebulaGambit: Preset = {
  id: "nebula-gambit",
  name: "Nebula Gambit",
  phase: "Opening",
  turn: "b",
  tagline: "A sacrifice wrapped in cosmic motion.",
  description:
    "White has opened the centre and offered a knight for rapid development. Black must decide whether to accept the gambit or burn fuel to retain the centre.",
  board: build(
    withMods(
      initialSpec,
      [[-2, -3], [-1, -4], [0, -1], [1, 1], [0, 1]],
      [[-2, -2, "w", "N"], [-1, -3, "w", "Q"], [0, 0, "w", "P"], [1, 0, "b", "P"], [0, 2, "b", "N"]],
    ),
  ),
};

const quantumSiege: Preset = {
  id: "quantum-siege",
  name: "Quantum Siege",
  phase: "Middlegame",
  turn: "w",
  tagline: "Rooks on open files, queens in the centre.",
  description:
    "The battlefield has thinned and the major pieces have found open lanes. White’s heavy artillery eyes Black’s king while pawns lock the centre into a slow-burning siege.",
  board: build(
    withMods(
      initialSpec,
      [[-3, -2], [3, -5], [-1, -1], [1, 1], [0, -1], [0, 1]],
      [[-3, -1, "w", "R"], [3, -4, "w", "R"], [-1, 0, "w", "P"], [1, 0, "b", "P"], [0, 0, "w", "Q"], [0, 2, "b", "B"]],
    ),
  ),
};

const starfieldBreak: Preset = {
  id: "starfield-break",
  name: "Starfield Break",
  phase: "Middlegame",
  turn: "b",
  tagline: "The centre has collapsed into sparks.",
  description:
    "Multiple pawn chains have fractured and both sides are chasing weaknesses across the board. The first player to seize the open files will steer the battle toward the stars.",
  board: build(
    withMods(
      initialSpec,
      [[3, -4], [1, -2], [-2, 5], [-1, 5], [0, 3], [0, -3]],
      [[3, -3, "w", "B"], [1, -1, "w", "P"], [-2, 4, "b", "N"], [-1, 4, "b", "P"], [0, 1, "b", "P"], [0, -2, "w", "N"]],
    ),
  ),
};

const voidOutpost: Preset = {
  id: "void-outpost",
  name: "Void Outpost",
  phase: "Endgame",
  turn: "w",
  tagline: "A lone rook defends a distant bastion.",
  description:
    "The armies are gone. White’s rook and king must close in before Black’s passed pawn reaches the back rank. Precision and patience decide the outpost’s fate.",
  board: build([
    [1, -3, "w", "K"],
    [0, 1, "w", "R"],
    [-1, 0, "w", "P"],
    [1, 3, "b", "K"],
    [-1, 3, "b", "P"],
    [3, 0, "b", "R"],
    [2, -1, "w", "B"],
  ]),
};

const echoesOfWar: Preset = {
  id: "echoes-of-war",
  name: "Echoes of War",
  phase: "Endgame",
  turn: "b",
  tagline: "Queens and knights dance over a shattered field.",
  description:
    "White’s queen probes the enemy camp while Black’s knight and pawn position themselves for one last counterstrike. The final moves will echo across the empty board.",
  board: build([
    [1, -4, "w", "K"],
    [0, 3, "w", "Q"],
    [-2, -1, "w", "B"],
    [3, 1, "b", "K"],
    [4, 0, "b", "P"],
    [2, 2, "b", "N"],
  ]),
};

export const PRESETS: Preset[] = [
  solarForge,
  nebulaGambit,
  quantumSiege,
  starfieldBreak,
  voidOutpost,
  echoesOfWar,
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
