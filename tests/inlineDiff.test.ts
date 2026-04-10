import assert from 'node:assert/strict';
import test from 'node:test';
import { computeDiff } from '../src/utils/diffEngine.js';

function flattenInline(changes?: { value: string }[]): string {
  if (!changes) return '';
  return changes.map((change) => change.value).join('');
}

test('inline diff preserves side-specific whitespace for modified lines', () => {
  const blocks = computeDiff('a b\n', 'a  b\n');
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].type, 'modified');

  const left = blocks[0].leftLines[0];
  const right = blocks[0].rightLines[0];

  assert.equal(left.content, 'a b');
  assert.equal(right.content, 'a  b');
  assert.equal(flattenInline(left.inlineChanges), 'a b');
  assert.equal(flattenInline(right.inlineChanges), 'a  b');
  assert.ok(left.inlineChanges?.some((part) => part.type === 'removed'));
  assert.ok(right.inlineChanges?.some((part) => part.type === 'added'));
});
