import type { FallingWord } from './falling-words';

export type Round = {
  targetId: number | null;
  input: string;
  score: number;
  completed: number;
  completedIds: number[];
  lastWord: string;
  lives: number;
  expiredSlots: number;
};

export function createRound(): Round {
  return { targetId: null, input: '', score: 0, completed: 0, completedIds: [], lastWord: '', lives: 3, expiredSlots: 0 };
}

export function syncRound(round: Round, words: FallingWord[], expiredSlots = round.expiredSlots): Round {
  if (round.lives === 0) return round;
  const expired = Math.max(round.expiredSlots, expiredSlots);
  const completedExpirations = round.completedIds.filter((id) => id >= round.expiredSlots && id < expired).length;
  const missed = Math.max(0, expired - round.expiredSlots - completedExpirations);
  const lives = Math.max(0, round.lives - missed);
  const targetExpired = round.targetId !== null && !words.some((word) => word.id === round.targetId);
  return {
    ...round,
    lives,
    expiredSlots: expired,
    targetId: targetExpired || lives === 0 ? null : round.targetId,
    input: targetExpired || lives === 0 ? '' : round.input,
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
  if (previous.lives === 0) return previous;
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
