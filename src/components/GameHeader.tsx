import type { GameApi } from "../types/game";

type Props = { game: GameApi };

export function GameHeader({ game }: Props) {
  return (
    <header className="game-header">
      <div>
        <h1>Wordfall</h1>
      </div>
      <div className="live-score">
        <span className="score-label">SCORE</span>
        <strong>{String(game.stats.score).padStart(4, "0")}</strong>
      </div>
    </header>
  );
}
