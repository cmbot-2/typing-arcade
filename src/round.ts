import type { FallingWord } from './falling-words';

export type Round = {
  targetId: number | null;
  input: string;
  score: number;
  completed: number;
  completedIds: number[];
  lastWord: string;
};

export function createRound(): Round {
  return { targetId: null, input: '', score: 0, completed: 0, completedIds: [], lastWord: '' };
}

export function syncRound(round: Round, words: FallingWord[]): Round {
  const targetExpired = round.targetId !== null && !words.some((word) => word.id === round.targetId);
  return {
    ...round,
    targetId: targetExpired ? null : round.targetId,
    input: targetExpired ? '' : round.input,
    // Remember only completed words whose spawn slots are still on screen.
    completedIds: round.completedIds.filter((id) => words.some((word) => word.id === id)),
  };
}

export function matchedLength(word: string, input: string): number {
  let length = 0;
  while (length < word.length && length < input.length && word[length] === input[length]?.toLowerCase()) length++;
  return length;
}

export function typeInput(previous: Round, words: FallingWord[], value: string): Round {
  const round = syncRound(previous, words);
  if (!value) return { ...round, input: '', targetId: null };
  const available = words.filter((word) => !round.completedIds.includes(word.id));
  // Words arrive in spawn order: the oldest matching word wins ties.
  const target = round.targetId === null
    ? available.find((word) => word.text.startsWith(value[0]!.toLowerCase()))
    : available.find((word) => word.id === round.targetId);
  if (!target) return { ...round, input: value, targetId: null };
  if (value.toLowerCase() !== target.text) return { ...round, input: value, targetId: target.id };
  return {
    ...round,
    targetId: null,
    input: '',
    score: round.score + target.text.length * 10,
    completed: round.completed + 1,
    completedIds: [...round.completedIds, target.id],
    lastWord: target.text,
  };
}
