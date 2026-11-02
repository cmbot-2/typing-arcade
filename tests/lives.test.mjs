import assert from 'node:assert/strict';
import test from 'node:test';
import { expiredWordCount, wordsAt } from '../.test-build/falling-words.js';
import { createRound, syncRound, typeInput } from '../.test-build/round.js';

const advance = (round, elapsed) => syncRound(round, wordsAt(elapsed), expiredWordCount(elapsed));

test('each missed word costs exactly one life at the bottom boundary', () => {
  let round = typeInput(createRound(), wordsAt(0), 'or');
  assert.equal(advance(round, 7999).lives, 3);
  round = advance(round, 8000);
  assert.equal(round.lives, 2);
  assert.equal(round.input, '');
  assert.equal(round.targetId, null);
  assert.equal(advance(round, 8000).lives, 2);
  assert.equal(advance(round, 9599).lives, 2);
  round = advance(round, 9600);
  assert.equal(round.lives, 1);
  round = advance(round, 11200);
  assert.equal(round.lives, 0);
  assert.equal(advance(round, 86400000), round);
  assert.equal(typeInput(round, wordsAt(11200), 'bloom'), round);
});

test('completed words never cost lives and large frame jumps count skipped misses', () => {
  let round = typeInput(createRound(), wordsAt(0), 'orbit');
  round = advance(round, 8000);
  assert.equal(round.lives, 3);
  assert.deepEqual(round.completedIds, []);
  assert.equal(advance(round, 9600).lives, 2);
  const twoCompleted = typeInput(typeInput(createRound(), wordsAt(1600), 'orbit'), wordsAt(1600), 'mint');
  assert.equal(advance(twoCompleted, 11200).lives, 2);
  assert.equal(advance(twoCompleted, 14400).lives, 0);
  assert.equal(advance(twoCompleted, 86400000).score, 90);
  assert.equal(advance(createRound(), 86400000).lives, 0);
  assert.equal(createRound().lives, 3);
});
