import assert from 'node:assert/strict';
import test from 'node:test';
import { computeDiff, computeStats } from '../src/utils/diffEngine.js';

test('computeStats returns zero stats for identical texts', () => {
  const stats = computeStats(computeDiff('a\nb\n', 'a\nb\n'));
  assert.deepEqual(stats, {
    filesChanged: 0,
    insertions: 0,
    deletions: 0,
  });
});

test('computeStats counts pure additions as insertions', () => {
  const stats = computeStats(computeDiff('', 'a\nb\n'));
  assert.deepEqual(stats, {
    filesChanged: 1,
    insertions: 2,
    deletions: 0,
  });
});

test('computeStats counts line replacements as deletion plus insertion', () => {
  const stats = computeStats(computeDiff('a\nb\n', 'a\nc\nd\n'));
  assert.deepEqual(stats, {
    filesChanged: 1,
    insertions: 2,
    deletions: 1,
  });
});
