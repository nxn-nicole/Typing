import { GameBoard } from "./components/GameBoard";
import { GameHeader } from "./components/GameHeader";
import { HistoryPanel } from "./components/HistoryPanel";
import { useTypingGame } from "./hooks/useTypingGame";

function App() {
  const game = useTypingGame();

  return (
    <main className="app-shell">
      <div className="app-backdrop backdrop-one" />
      <div className="app-backdrop backdrop-two" />
      <div className="app-layout">
        <section className="game-column">
          <GameHeader game={game} />
          <GameBoard game={game} />
          <p className="keyboard-hint mb-2">
            Type the falling words before they reach the red line. Press{" "}
            <kbd>Enter</kbd> to start.
          </p>
        </section>
        <HistoryPanel history={game.history} onClear={game.clearHistory} />
      </div>
    </main>
  );
}

export default App;
