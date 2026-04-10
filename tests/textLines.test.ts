import assert from 'node:assert/strict';
import test from 'node:test';
import {
  replaceLineRange,
  sliceLineRange,
  splitLogicalLines,
} from '../src/utils/textLines.js';

test('splitLogicalLines keeps newline terminators per line', () => {
  assert.deepEqual(splitLogicalLines('a\nb\n'), ['a\n', 'b\n']);
  assert.deepEqual(splitLogicalLines('a\nb'), ['a\n', 'b']);
  assert.deepEqual(splitLogicalLines('a\r\nb\rc'), ['a\n', 'b\n', 'c']);
  assert.deepEqual(splitLogicalLines('\n'), ['\n']);
  assert.deepEqual(splitLogicalLines(''), []);
});

test('replaceLineRange can preserve trailing newline at EOF', () => {
  const leftText = 'a\n';
  const rightText = 'a';
  const leftRange = sliceLineRange(leftText, 0, 1);

  const merged = replaceLineRange(rightText, 0, 1, leftRange);
  assert.equal(merged, 'a\n');
});

test('replaceLineRange can remove trailing newline at EOF', () => {
  const leftText = 'a\n';
  const rightText = 'a';
  const rightRange = sliceLineRange(rightText, 0, 1);

  const merged = replaceLineRange(leftText, 0, 1, rightRange);
  assert.equal(merged, 'a');
});
