import type { GameApi } from "../types/game";

type Props = { game: GameApi };

export function GameHeader({ game }: Props) {
  return (
    <header className="game-header">
      <div>
        <p className="eyebrow">ARCADE / 01</p>
        <h1>Wordfall</h1>
        <p className="word-bank-status">
          {game.wordBankStatus === "loading"
            ? "Loading word bank..."
            : game.wordBankStatus === "online"
              ? "Online word bank"
              : "Local word bank"}
        </p>
      </div>
      <div className="live-score">
        <span className="score-label">SCORE</span>
        <strong>{String(game.stats.score).padStart(4, "0")}</strong>
      </div>
    </header>
  );
}
