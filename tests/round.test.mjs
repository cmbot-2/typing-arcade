import assert from 'node:assert/strict';
import test from 'node:test';
import { createRound, matchedLength, syncRound, typeInput } from '../.test-build/round.js';

const words = ['orbit', 'oak', 'mint'].map((text, id) => ({ text, id, lane: id, progress: 0 }));

test('first matching character locks the oldest target and mistakes require correction', () => {
  let round = typeInput(createRound(), words, 'O');
  assert.equal(round.targetId, 0);
  round = typeInput(round, words, 'oak');
  assert.equal(round.targetId, 0);
  assert.equal(round.score, 0);
  assert.equal(matchedLength('orbit', 'ORx'), 2);
  round = typeInput(round, words, 'orbit');
  assert.equal(round.score, 50);
  assert.equal(round.completed, 1);
  assert.equal(round.input, '');
  assert.equal(round.targetId, null);
  assert.deepEqual(round.completedIds, [0]);
  const repeated = typeInput(round, words, 'orbit');
  assert.equal(repeated.score, 50);
  assert.equal(repeated.completed, 1);
});

test('completion removes only the selected word, even when another word has identical text', () => {
  const duplicates = [words[0], { ...words[0], id: 4 }];
  const round = typeInput(createRound(), duplicates, 'orbit');
  assert.deepEqual(round.completedIds, [0]);
  assert.equal(round.score, 50);
  assert.equal(typeInput(round, duplicates, 'o').targetId, 4);
});

test('expired targets clear input and old completion IDs do not accumulate', () => {
  const locked = typeInput(createRound(), words, 'o');
  const expired = syncRound(locked, words.slice(1));
  assert.equal(expired.targetId, null);
  assert.equal(expired.input, '');
  const scored = typeInput(createRound(), words, 'mint');
  const later = syncRound(scored, []);
  assert.equal(later.score, 40);
  assert.deepEqual(later.completedIds, []);
  assert.equal(typeInput(locked, words, '').targetId, null);
  assert.equal(typeInput(createRound(), words, '<img>').score, 0);
  assert.equal(createRound().score, 0);
});
