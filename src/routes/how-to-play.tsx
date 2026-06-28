import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/how-to-play")({
  head: () => ({
    meta: [
      {
        title:
          "How to Play Hexagonal Chess — Gliński's Hexagonal Chess Rules",
      },
      {
        name: "description",
        content:
          "Learn how to play hexagonal chess with our complete guide to Gliński's hexagonal chess rules. Piece movement, 91-hex board setup, pawn rules, and strategy for the classic three-colour variant.",
      },
      {
        name: "keywords",
        content:
          "how to play hexagonal chess, Gliński's hexagonal chess rules, hex chess rules, hexagonal chess guide, Gliński chess, 91 hex chess board, hex chess piece movement",
      },
      {
        property: "og:title",
        content:
          "How to Play Hexagonal Chess — Gliński's Hexagonal Chess Rules",
      },
      {
        property: "og:description",
        content:
          "Complete guide to Gliński's Hexagonal Chess rules: board setup, piece movement, and winning conditions on a 91-hex board.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://hexhearth.app/how-to-play" },
      {
        name: "twitter:title",
        content:
          "How to Play HexHearth — Gliński's Hexagonal Chess Rules",
      },
      {
        name: "twitter:description",
        content:
          "Complete guide to Gliński's Hexagonal Chess rules: board setup, piece movement, and winning conditions on a 91-hex board.",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://hexhearth.app/how-to-play",
      },
    ],
  }),
  component: HowToPlay,
});

function HowToPlay() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <nav className="mb-8">
          <Link
            to="/"
            className="text-sm text-primary hover:underline underline-offset-4"
          >
            ← Back to game
          </Link>
        </nav>

        <article>
          <header className="mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              How to Play HexHearth
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              A complete guide to the classic 91-hex variant, piece movement,
              and winning conditions.
            </p>
          </header>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              What Is Gliński's Hexagonal Chess?
            </h2>
            <p className="text-foreground/90 leading-relaxed">
              Gliński's Hexagonal Chess is the most popular variant of
              hexagonal chess, invented by Władysław Gliński in 1936. It is
              played on a 91-hex board with three colours instead of the
              traditional two-colour square chessboard. Each side has 18 pieces,
              and the objective is the same as orthodox chess: checkmate the
              opponent's king.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              The 91-Hex Board and Setup
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The board consists of 91 hexagonal cells arranged in a hexagon
              with a radius of 5. Each cell is one of three colours. White
              starts on one side of the board and Black on the opposite side.
            </p>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Each player begins with 18 pieces:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-foreground/90">
              <li>1 King</li>
              <li>1 Queen</li>
              <li>2 Rooks</li>
              <li>3 Bishops</li>
              <li>2 Knights</li>
              <li>9 Pawns</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed mt-4">
              The centre file holds three bishops — an extra bishop compared to
              standard chess — which helps balance the hexagonal geometry.
              Pawns are placed across the front ranks in a staggered line that
              matches the hexagonal grid.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              How Pieces Move on a Hex Grid
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-6">
              On a hexagonal grid, pieces gain an extra direction of movement
              compared to square chess. There are 6 orthogonal (straight-line)
              neighbours and 6 diagonal neighbours around every hex.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Rook
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The rook slides any distance along the 6 orthogonal hex
              directions. Think of it as moving along the 6 "spokes" radiating
              from each hex — like a queen restricted to straight lines only.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Bishop
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The bishop slides any distance along the 6 diagonal hex
              directions. Because the board has three colours, each bishop is
              confined to cells of a single colour — but with three bishops per
              side, every colour is covered.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Queen
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The queen combines rook and bishop movement, giving it 12
              directions in total — the most powerful piece on the board.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              King
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The king moves one step in any of the 12 directions (6 orthogonal
              + 6 diagonal). It may never move into check.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Knight
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The knight makes a "hex leap": one orthogonal step followed by
              one diagonal step outward. This creates 12 possible knight jumps
              on the hex grid — twice as many as on a square board. The knight
              always lands on a cell of the opposite colour set from where it
              started.
            </p>

            <h3 className="text-xl font-semibold tracking-tight mb-2">
              Pawn
            </h3>
            <p className="text-foreground/90 leading-relaxed mb-4">
              Pawns move straight forward one hex toward the opponent's side.
              From any of their starting cells, they may also advance two hexes
              on their first move. Pawns capture on the two forward-oblique hex
              neighbours — the two cells that sit diagonally ahead of them.
            </p>
            <p className="text-foreground/90 leading-relaxed mb-4">
              When a pawn reaches the far edge of the board (the opponent's
              back rank), it promotes. In this implementation, pawns promote to
              a Queen, Rook, Bishop, or Knight of the same colour.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              How to Win: Check, Checkmate, and Stalemate
            </h2>
            <p className="text-foreground/90 leading-relaxed mb-4">
              The game ends when a king is attacked and has no legal escape —
              this is <strong>checkmate</strong>. The player who delivers
              checkmate wins.
            </p>
            <p className="text-foreground/90 leading-relaxed mb-4">
              If a player has no legal moves but their king is not in check,
              the game is a <strong>stalemate</strong> draw.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              A king may never move into check. If your king is under attack,
              you must address the threat by moving the king, blocking the
              attack, or capturing the attacking piece.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Key Differences from Square Chess
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>
                <strong>Three colours</strong> instead of two, creating a unique
                visual pattern and extra bishop coverage.
              </li>
              <li>
                <strong>Three bishops per side</strong> — one for each colour —
                so every diagonal on the board can be controlled.
              </li>
              <li>
                <strong>Nine pawns</strong> arranged in a staggered front line
                that matches the hexagonal geometry.
              </li>
              <li>
                <strong>12 directions</strong> for the queen and king, and 12
                knight jumps, expanding tactical possibilities.
              </li>
              <li>
                <strong>No castling</strong> in this implementation. King
                safety must be managed through piece placement and early
                development.
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold tracking-tight mb-4">
              Tips for Beginners
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>
                Control the centre. The middle of the hex board radiates influence
                in 12 directions, making it even more valuable than the centre
                of a square board.
              </li>
              <li>
                Develop your knights and bishops early to exploit the extra
                directions available on the hex grid.
              </li>
              <li>
                Pawns protect the pawns beside them, allowing them to form
                solid walls across the board. A connected line of pawns can be
                surprisingly difficult for the opponent to break through.
              </li>
              <li>
                Use your extra bishop to switch between colour complexes and
                create threats on diagonals that standard chess bishops cannot
                reach.
              </li>
            </ul>
          </section>

          <div className="mt-10 pt-8 border-t border-border">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Play Hex Chess Now
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
