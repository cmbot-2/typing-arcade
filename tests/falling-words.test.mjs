import assert from 'node:assert/strict';
import test from 'node:test';
import { wordsAt } from '../.test-build/falling-words.js';

test('the same elapsed time gives the same positions at different refresh rates', () => {
  const results = [30, 60, 144].map((fps) => {
    let words;
    for (let frame = 0; frame <= fps * 4; frame++) words = wordsAt(frame * 1000 / fps);
    return words;
  });
  assert.deepEqual(results[0], results[1]);
  assert.deepEqual(results[1], results[2]);
  assert.equal(results[0][0].progress, 0.5);
});

test('spawning and removal stay bounded through long rounds and large time steps', () => {
  assert.equal(wordsAt(1599).length, 1);
  assert.equal(wordsAt(1600).length, 2);
  assert(wordsAt(7999).some((word) => word.id === 0));
  assert(!wordsAt(8000).some((word) => word.id === 0));
  for (const elapsed of [0, 8000, 8001, 60000, 86400000]) {
    const words = wordsAt(elapsed);
    assert(words.length > 0 && words.length <= 5);
    assert.equal(new Set(words.map((word) => word.id)).size, words.length);
    assert(words.every((word) => word.progress >= 0 && word.progress < 1));
    assert(words.every((word) => word.lane >= 0 && word.lane < 3));
  }
});
