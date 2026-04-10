import assert from 'node:assert/strict';
import test from 'node:test';
import {
  findCurrentDiffIndex,
  getScrollTopForDiff,
  getScrollTopForDiffInViewport,
} from '../src/utils/diffNavigation.js';
import type { BlockRange } from '../src/utils/annotations.js';

const LINE_HEIGHT = 22;

const ranges: BlockRange[] = [
  {
    blockId: 0,
    type: 'modified',
    leftStart: 0,
    leftCount: 2,
    rightStart: 0,
    rightCount: 2,
  },
  {
    blockId: 1,
    type: 'added',
    leftStart: 5,
    leftCount: 0,
    rightStart: 5,
    rightCount: 2,
  },
  {
    blockId: 2,
    type: 'removed',
    leftStart: 9,
    leftCount: 1,
    rightStart: 11,
    rightCount: 0,
  },
];

test('findCurrentDiffIndex follows viewport top and does not stick to first range', () => {
  assert.equal(findCurrentDiffIndex(ranges, 0, LINE_HEIGHT), 0);
  assert.equal(findCurrentDiffIndex(ranges, 4 * LINE_HEIGHT, LINE_HEIGHT), 1);
  assert.equal(findCurrentDiffIndex(ranges, 8 * LINE_HEIGHT, LINE_HEIGHT), 2);
  assert.equal(findCurrentDiffIndex(ranges, 9999, LINE_HEIGHT), 2);
});

test('getScrollTopForDiff keeps a small top margin and works with zero-count sides', () => {
  assert.equal(getScrollTopForDiff(ranges[0], LINE_HEIGHT), 0);
  assert.equal(getScrollTopForDiff(ranges[1], LINE_HEIGHT), 4 * LINE_HEIGHT);
});

test('getScrollTopForDiffInViewport keeps scroll when target is already visible', () => {
  const viewportHeight = 20 * LINE_HEIGHT;
  assert.equal(
    getScrollTopForDiffInViewport(ranges[1], LINE_HEIGHT, 0, viewportHeight),
    0
  );
});

test('getScrollTopForDiffInViewport scrolls when target is below viewport', () => {
  const viewportHeight = 4 * LINE_HEIGHT;
  assert.equal(
    getScrollTopForDiffInViewport(ranges[2], LINE_HEIGHT, 0, viewportHeight),
    8 * LINE_HEIGHT
  );
});
