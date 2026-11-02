import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceClock, createClock, pauseClock, resumeClock } from '../.test-build/clock.js';
import { expiredWordCount, wordsAt } from '../.test-build/falling-words.js';
import { createRound, syncRound, typeInput } from '../.test-build/round.js';

test('long pauses preserve positions, lives and partial input until explicit resume', () => {
  let clock = resumeClock(createClock(), 100);
  clock = pauseClock(clock, 8099);
  let round = typeInput(createRound(), wordsAt(clock.elapsed), 'or');
  const words = wordsAt(clock.elapsed);
  const saved = structuredClone(round);
  clock = advanceClock(clock, 86400000);
  assert.deepEqual(wordsAt(clock.elapsed), words);
  round = syncRound(round, words, expiredWordCount(clock.elapsed));
  assert.deepEqual(round, saved);
  clock = resumeClock(clock, 86400100);
  assert.equal(clock.elapsed, 7999);
  clock = advanceClock(clock, 86400101);
  round = syncRound(round, wordsAt(clock.elapsed), expiredWordCount(clock.elapsed));
  assert.equal(round.lives, 2);
  assert.equal(round.input, '');
});

test('repeated pause and resume calls cannot add paused time or reset a running baseline', () => {
  let clock = resumeClock(createClock(), 1000);
  clock = resumeClock(clock, 1100);
  clock = pauseClock(clock, 1500);
  clock = pauseClock(clock, 5000);
  assert.equal(clock.elapsed, 500);
  for (let index = 0; index < 20; index++) {
    clock = resumeClock(clock, 6000 + index * 1000);
    clock = pauseClock(clock, 6100 + index * 1000);
  }
  assert.equal(clock.elapsed, 2500);
  assert.deepEqual(createClock(), { elapsed: 0, previous: null, paused: true });
});

test('invalid and backward frame times do not double-count play time', () => {
  let clock = resumeClock(createClock(), 100);
  for (const time of [NaN, Infinity]) assert.equal(advanceClock(clock, time), clock);
  clock = advanceClock(clock, 90);
  assert.equal(clock.elapsed, 0);
  clock = advanceClock(clock, 110);
  assert.equal(clock.elapsed, 10);
  const paused = pauseClock(clock, 110);
  assert.equal(resumeClock(paused, NaN), paused);
});
