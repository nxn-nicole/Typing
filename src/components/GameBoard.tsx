import type { GameApi } from "../types/game";

type Props = { game: GameApi };

export function GameBoard({ game }: Props) {
  return (
    <section className="game-board" aria-label="Typing game board">
      <div className="board-grid" />
      <div className="board-topline">
        <span>
          LEVEL {Math.min(9, Math.floor(game.stats.elapsed / 12) + 1)}
        </span>
        <div className="board-controls">
          {game.mode !== "endless" && (
            <span className="lives" aria-label={`${game.stats.lives} lives`}>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={index < game.stats.lives ? "life active" : "life"}
                >
                  <span className="pixel-heart" aria-hidden="true" />
                </span>
              ))}
            </span>
          )}
          {(game.status === "playing" || game.status === "paused") && (
            <button
              type="button"
              className="pause-button"
              onClick={game.togglePause}
              aria-label={
                game.status === "paused" ? "Resume game" : "Pause game"
              }
            >
              {game.status === "paused" ? "RESUME" : "PAUSE"}
            </button>
          )}
          {game.mode === "endless" && game.status === "playing" && (
            <button
              type="button"
              className="pause-button"
              onClick={game.endGame}
            >
              END RUN
            </button>
          )}
        </div>
      </div>

      {game.words.map((word) => {
        const selected = word.id === game.targetId;
        const typedLength = selected ? game.typed.length : 0;
        return (
          <div
            className={`falling-word${selected ? " selected" : ""}`}
            key={word.id}
            style={{ left: `${word.x}%`, top: `${word.y}px` }}
          >
            <span className="typed-part">
              {word.text.slice(0, typedLength)}
            </span>
            {word.text.slice(typedLength)}
          </div>
        );
      })}

      <div className="danger-line">
        <span>TYPE ZONE</span>
      </div>
      {game.status !== "playing" && game.status !== "paused" && (
        <div className="game-overlay">
          <div className="overlay-copy">
            <span className="overlay-kicker">
              {game.status === "over" ? "RUN COMPLETE" : "READY PLAYER"}
            </span>
            <h2>
              {game.status === "over"
                ? "Keep the rhythm."
                : game.mode === "letter"
                  ? "Catch every letter."
                  : "Catch every word."}
            </h2>
            {game.status === "over" ? (
              <p className="pb-2">
                {game.stats.score} points / {game.wpm} WPM / {game.accuracy}%
                accuracy
              </p>
            ) : (
              <p>Type the highlighted word before it crosses the line.</p>
            )}
            <button
              type="button"
              className="start-button mt-3"
              onClick={game.start}
            >
              {game.status === "over" ? "PLAY AGAIN" : "START GAME"}{" "}
            </button>
          </div>
        </div>
      )}
      {game.status === "paused" && (
        <div className="game-overlay pause-overlay">
          <div className="overlay-copy">
            <span className="overlay-kicker">GAME PAUSED</span>
            <h2>Take a breath.</h2>
            <p className="pb-2">Your run is waiting right where you left it.</p>
            <button
              type="button"
              className="start-button my-2"
              onClick={game.togglePause}
            >
              RESUME GAME
            </button>
          </div>
        </div>
      )}
      {game.celebrationVisible && (
        <div className="celebration-popup" role="dialog" aria-live="polite">
          <div className="celebration-label">
            <span className="overlay-kicker">NICE WORK</span>
            <span className="celebration-spark" aria-hidden="true">
              ♥
            </span>
          </div>
          <h3>You got a kiss from Nicole.</h3>
        </div>
      )}
    </section>
  );
}
