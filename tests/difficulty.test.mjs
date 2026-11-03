import assert from 'node:assert/strict';
import test from 'node:test';
import { difficultyAt, expiredWordCount, wordsAt } from '../.test-build/falling-words.js';
import { createRound, syncRound, typeInput } from '../.test-build/round.js';
import { createClock, resumeClock, pauseClock, advanceClock } from '../.test-build/clock.js';

test('difficulty increases every thirty active seconds and stops at level four', () => {
  for (const [elapsed, level, interval] of [[0, 1, 1600], [29999, 1, 1600], [30000, 2, 1400], [60000, 3, 1200], [90000, 4, 1000], [86400000, 4, 1000]]) {
    assert.deepEqual(difficultyAt(elapsed), { level, spawnInterval: interval, fallDuration: interval * 5 });
  }
  for (const [elapsed, min, max] of [[8000, 4, 5], [40000, 5, 6], [70000, 6, 7], [100000, 7, 8]]) {
    assert(wordsAt(elapsed).every(({ text }) => text.length >= min && text.length <= max));
  }
});

test('level transitions preserve words and positions while respecting the five-word cap', () => {
  for (const boundary of [30000, 60000, 90000]) {
    const before = wordsAt(boundary - .001);
    const after = wordsAt(boundary + .001);
    for (const word of before) {
      const same = after.find(({ id }) => id === word.id);
      assert(same);
      assert.equal(same.text, word.text);
      assert.equal(same.lane, word.lane);
      assert(same.progress >= word.progress && same.progress - word.progress < .000001);
    }
  }
  let previousExpired = 0;
  for (let elapsed = 0; elapsed <= 180000; elapsed += 17) {
    const words = wordsAt(elapsed);
    const expired = expiredWordCount(elapsed);
    assert(words.length >= 1 && words.length <= 5);
    assert(words.every(({ progress }) => progress >= 0 && progress < 1));
    assert(expired >= previousExpired);
    assert.equal(words[0].id, expired);
    previousExpired = expired;
  }
  assert.equal(wordsAt(Number.MAX_VALUE).length, 5);
  for (const elapsed of [-1, NaN, Infinity]) assert.deepEqual(wordsAt(elapsed), []);
});

test('a perfect run survives every transition and misses at maximum difficulty count once', () => {
  let round = createRound();
  for (let elapsed = 0; elapsed <= 120000; elapsed += 100) {
    const words = wordsAt(elapsed);
    round = syncRound(round, words, expiredWordCount(elapsed));
    for (const word of words) if (!round.completedIds.includes(word.id)) round = typeInput(round, words, word.text);
    assert.equal(round.lives, 3);
    assert(round.completedIds.length <= 5);
  }
  const score = round.score;
  round = syncRound(round, wordsAt(126000), expiredWordCount(126000));
  assert.equal(round.lives, 2);
  assert.equal(syncRound(round, wordsAt(126000), expiredWordCount(126000)).lives, 2);
  round = syncRound(round, wordsAt(86400000), expiredWordCount(86400000));
  assert.equal(round.lives, 0);
  assert.equal(round.score, score);
});

test('pausing freezes the difficulty boundary and restarting returns to the gentle pace', () => {
  let clock = pauseClock(resumeClock(createClock(), 0), 29999);
  clock = advanceClock(clock, 86400000);
  assert.equal(difficultyAt(clock.elapsed).level, 1);
  clock = advanceClock(resumeClock(clock, 86400000), 86400001);
  assert.equal(difficultyAt(clock.elapsed).level, 2);
  assert.equal(difficultyAt(createClock().elapsed).level, 1);
});
