import { createFileRoute, Link } from "@tanstack/react-router";

const BOT_LEVELS = [
  {
    id: "neon-apprentice",
    title: "Neon Apprentice",
    label: "Easy",
    description:
      "A friendly introduction to HexHearth. This bot makes basic moves and lets you learn the board geometry without pressure.",
  },
  {
    id: "pulse-adept",
    title: "Pulse Adept",
    label: "Casual",
    description:
      "A responsive opponent that values central control and safe development. Great for refining your opening instincts.",
  },
  {
    id: "quantum-tactician",
    title: "Quantum Tactician",
    label: "Intermediate",
    description:
      "A sharp tactical engine that hunts for forks, pins, and subtle sacrifices. Expect a challenging midgame with dynamic threats.",
  },
  {
    id: "void-strategist",
    title: "Void Strategist",
    label: "Advanced",
    description:
      "A methodical planner that builds pawn structures and probes for long-term advantages across the board.",
  },
  {
    id: "starborn-grandmaster",
    title: "Starborn Grandmaster",
    label: "Hard",
    description:
      "A powerful adversary that balances material with position. It will punish careless moves and reward smart coordination.",
  },
  {
    id: "ai-overlord",
    title: "AI Overlord",
    label: "Expert",
    description:
      "The ultimate challenge in HexHearth. This bot plays aggressively, calculates deeply, and forces you to stay precise.",
  },
];

export const Route = createFileRoute("/bots")({
  head: () => ({
    meta: [
      { title: "Bots — HexHearth AI Opponents" },
      {
        name: "description",
        content:
          "Choose from six sci-fi themed HexHearth bots ranging from Beginner to Expert. Practice openings, tactics, and endgames against AI difficulty tiers.",
      },
      { property: "og:title", content: "Bots — HexHearth AI Opponents" },
      {
        property: "og:description",
        content:
          "Select a HexHearth bot and challenge yourself across six difficulty tiers, each with its own sci-fi persona.",
      },
      { property: "og:url", content: "https://hexhearth.app/bots" },
    ],
    links: [{ rel: "canonical", href: "https://hexhearth.app/bots" }],
  }),
  component: BotsPage,
});

function BotsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="mb-12 grid gap-6 lg:grid-cols-[1.35fr_0.75fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-primary/80 mb-3">
              HexHearth AI
            </p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Choose your opponent.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              Six sci-fi inspired bot tiers let you warm up, sharpen your tactics, or test your precision against a relentless machine.
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-card/80 p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.3em] text-primary/80 mb-4">
              Bot guidance
            </p>
            <div className="space-y-4 text-sm text-foreground/90 leading-relaxed">
              <p>
                Start with Neon Apprentice if you are new to hexagonal movement. Progress through Pulse Adept and Quantum Tactician as you master the three-colour board.
              </p>
              <p>
                Void Strategist and Starborn Grandmaster reward disciplined play, while AI Overlord is reserved for players who want a relentless, futuristic challenge.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {BOT_LEVELS.map((bot) => (
            <article
              key={bot.id}
              className="group rounded-3xl border border-border bg-card/70 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {bot.title}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground mt-1">
                    {bot.label}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary grid place-items-center text-lg font-bold">
                  {bot.label[0]}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-foreground/85 mb-6">
                {bot.description}
              </p>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                disabled
              >
                Coming soon
              </button>
            </article>
          ))}
        </div>

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
