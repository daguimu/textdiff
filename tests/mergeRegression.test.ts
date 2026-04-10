import assert from 'node:assert/strict';
import test from 'node:test';
import { computeAnnotations } from '../src/utils/annotations.js';
import { computeDiff } from '../src/utils/diffEngine.js';
import { replaceLineRange, sliceLineRange } from '../src/utils/textLines.js';

function acceptLeft(leftText: string, rightText: string): string {
  const { ranges } = computeAnnotations(computeDiff(leftText, rightText));
  const range = ranges[0];
  const leftBlock = sliceLineRange(leftText, range.leftStart, range.leftCount);
  return replaceLineRange(rightText, range.rightStart, range.rightCount, leftBlock);
}

function acceptRight(leftText: string, rightText: string): string {
  const { ranges } = computeAnnotations(computeDiff(leftText, rightText));
  const range = ranges[0];
  const rightBlock = sliceLineRange(rightText, range.rightStart, range.rightCount);
  return replaceLineRange(leftText, range.leftStart, range.leftCount, rightBlock);
}

test('accept-left keeps newline-only EOF differences', () => {
  assert.equal(acceptLeft('a\n', 'a'), 'a\n');
});

test('accept-right keeps newline-only EOF differences', () => {
  assert.equal(acceptRight('a\n', 'a'), 'a');
});

test('accept-left handles CRLF inputs and normalizes to LF internally', () => {
  assert.equal(acceptLeft('a\r\nb\r\n', 'a\r\nc\r\n'), 'a\nb\n');
});

test('accept-right handles CR-only inputs and normalizes to LF internally', () => {
  assert.equal(acceptRight('a\rb', 'a\rc'), 'a\nc');
});
