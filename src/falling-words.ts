const levels = [
  { interval: 1600, vocabulary: ['orbit', 'mint', 'spark', 'drift', 'glow', 'bloom'] },
  { interval: 1400, vocabulary: ['comet', 'ripple', 'cloud', 'meadow', 'stone', 'forest'] },
  { interval: 1200, vocabulary: ['planet', 'lantern', 'ribbon', 'sunrise', 'silver', 'whisper'] },
  { interval: 1000, vocabulary: ['starlit', 'daydream', 'journey', 'sunlight', 'orchard', 'raindrop'] },
] as const;
export const levelDuration = 30000;
export const maxActiveWords = 5;

export type FallingWord = { id: number; text: string; lane: number; progress: number };

export function difficultyAt(elapsed: number) {
  const index = Number.isFinite(elapsed) ? Math.min(levels.length - 1, Math.max(0, Math.floor(elapsed / levelDuration))) : 0;
  const level = levels[index]!;
  return { level: index + 1, spawnInterval: level.interval, fallDuration: level.interval * maxActiveWords };
}

// Integrate speed over active play time. A word falls for five spawn beats, so
// level changes speed up existing words without jumps or a sixth active slot.
function beatsAt(elapsed: number): number {
  let remaining = Math.min(elapsed, Number.MAX_SAFE_INTEGER);
  let beats = 0;
  for (let index = 0; index < levels.length; index++) {
    const duration = index === levels.length - 1 ? remaining : Math.min(remaining, levelDuration);
    beats += duration / levels[index]!.interval;
    remaining -= duration;
  }
  return beats;
}

function vocabularyFor(id: number) {
  let boundary = 0;
  for (let index = 0; index < levels.length - 1; index++) {
    boundary += levelDuration / levels[index]!.interval;
    if (id < boundary) return levels[index]!.vocabulary;
  }
  return levels[levels.length - 1]!.vocabulary;
}

// IDs expire in spawn order, including slots skipped by a delayed frame.
export function expiredWordCount(elapsed: number): number {
  if (!Number.isFinite(elapsed) || elapsed < 0) return 0;
  return Math.max(0, Math.floor(beatsAt(elapsed)) - maxActiveWords + 1);
}

// Positions depend on elapsed milliseconds, independent of the display's refresh rate.
// Only the currently visible spawn slots are generated, even after a large time step.
export function wordsAt(elapsed: number): FallingWord[] {
  if (!Number.isFinite(elapsed) || elapsed < 0) return [];
  const beats = beatsAt(elapsed);
  const last = Math.floor(beats);
  const first = Math.max(0, last - maxActiveWords + 1);
  const words: FallingWord[] = [];
  for (let id = first; id <= last; id++) {
    const vocabulary = vocabularyFor(id);
    words.push({
      id,
      text: vocabulary[id % vocabulary.length]!,
      lane: id % 3,
      progress: (beats - id) / maxActiveWords,
    });
  }
  return words;
}
