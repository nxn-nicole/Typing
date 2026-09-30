import type { GameMode, HistoryEntry } from "../types/game";

type Props = { history: HistoryEntry[]; mode: GameMode; onClear: () => void };

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export function HistoryPanel({ history, mode, onClear }: Props) {
  return (
    <aside className="history-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">LOCAL MEMORY</p>
          <h2>{mode === "endless" ? "Endless runs" : "Classic runs"}</h2>
        </div>
        {history.length > 0 && (
          <button type="button" className="clear-button" onClick={onClear}>
            CLEAR
          </button>
        )}
      </div>
      {history.length === 0 ? (
        <div className="empty-history">
          <span className="empty-icon">+</span>
          <p>
            Your completed runs
            <br />
            will appear here.
          </p>
        </div>
      ) : (
        <ol className="history-list">
          {history.map((run, index) => (
            <li className="history-item" key={run.id}>
              <span className="run-number">0{index + 1}</span>
              <div className="run-details">
                <strong>{run.score} pts</strong>
                <span>
                  {run.wordsCompleted} words /{" "}
                  {run.totalKeys
                    ? Math.round((run.correctKeys / run.totalKeys) * 100)
                    : 100}
                  % accuracy
                </span>
              </div>
              <time dateTime={run.playedAt}>{formatDate(run.playedAt)}</time>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
