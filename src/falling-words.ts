const vocabulary = ['orbit', 'mint', 'spark', 'drift', 'glow', 'bloom'];
const spawnInterval = 1600;
const fallDuration = 8000;

export type FallingWord = { id: number; text: string; lane: number; progress: number };

// Count every expired spawn slot, including slots skipped by a delayed frame.
export function expiredWordCount(elapsed: number): number {
  if (!Number.isFinite(elapsed) || elapsed < fallDuration) return 0;
  return Math.floor((elapsed - fallDuration) / spawnInterval) + 1;
}

// Positions depend on elapsed milliseconds, independent of the display's refresh rate.
// Only the currently visible spawn slots are generated, even after a large time step.
export function wordsAt(elapsed: number): FallingWord[] {
  if (!Number.isFinite(elapsed) || elapsed < 0) return [];
  const first = expiredWordCount(elapsed);
  const last = Math.floor(elapsed / spawnInterval);
  const words: FallingWord[] = [];
  for (let id = first; id <= last; id++) {
    words.push({
      id,
      text: vocabulary[id % vocabulary.length]!,
      lane: id % 3,
      progress: (elapsed - id * spawnInterval) / fallDuration,
    });
  }
  return words;
}
