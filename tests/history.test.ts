import assert from 'node:assert/strict';
import test from 'node:test';
import { appendSnapshot, type Snapshot } from '../src/utils/history.js';

test('appendSnapshot deduplicates consecutive identical states', () => {
  const snapshot: Snapshot = { left: 'a', right: 'b' };
  const history = appendSnapshot([], snapshot);
  const deduped = appendSnapshot(history, snapshot);
  assert.equal(deduped.length, 1);
});

test('appendSnapshot caps history length', () => {
  let history: Snapshot[] = [];
  const limit = 3;

  history = appendSnapshot(history, { left: '1', right: '1' }, limit);
  history = appendSnapshot(history, { left: '2', right: '2' }, limit);
  history = appendSnapshot(history, { left: '3', right: '3' }, limit);
  history = appendSnapshot(history, { left: '4', right: '4' }, limit);

  assert.deepEqual(history, [
    { left: '2', right: '2' },
    { left: '3', right: '3' },
    { left: '4', right: '4' },
  ]);
});
