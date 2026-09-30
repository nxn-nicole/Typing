import type { GameApi, GameMode } from "../types/game";

type Props = Pick<GameApi, "mode" | "setMode" | "status">;

const modes: { value: GameMode; label: string }[] = [
  { value: "classic", label: "CLASSIC" },
  { value: "endless", label: "ENDLESS" },
];

export function GameModeSelector({ mode, setMode, status }: Props) {
  const disabled = status === "playing" || status === "paused";

  return (
    <div className="mode-selector" aria-label="Game mode">
      {modes.map((option) => (
        <button
          type="button"
          key={option.value}
          className={
            mode === option.value ? "mode-button active" : "mode-button"
          }
          onClick={() => setMode(option.value)}
          disabled={disabled}
          aria-pressed={mode === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
