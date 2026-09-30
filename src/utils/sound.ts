let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
};

const playTone = (
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType,
  endFrequency = frequency,
) => {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(20, endFrequency),
    now + duration,
  );
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.01);
};

export const playCorrectSound = () => {
  playTone(620, 0.055, 0.045, "sine", 760);
};

export const playCompleteSound = () => {
  playTone(620, 0.09, 0.05, "sine", 820);
  window.setTimeout(() => playTone(880, 0.12, 0.045, "sine", 1040), 55);
};

export const playFailureSound = () => {
  playTone(180, 0.12, 0.06, "square", 110);
};
