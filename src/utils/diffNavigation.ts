import type { BlockRange } from './annotations.js';

const MIN_RANGE_LINES = 1;

function effectiveCount(count: number): number {
  return Math.max(MIN_RANGE_LINES, count);
}

function rangeTopLine(range: BlockRange): number {
  return Math.min(range.leftStart, range.rightStart);
}

function rangeBottomLine(range: BlockRange): number {
  return Math.max(
    range.leftStart + effectiveCount(range.leftCount),
    range.rightStart + effectiveCount(range.rightCount)
  );
}

export function findCurrentDiffIndex(
  ranges: readonly BlockRange[],
  scrollTop: number,
  lineHeight: number
): number {
  if (ranges.length === 0) return -1;
  const viewportTop = scrollTop + 1;

  for (let i = 0; i < ranges.length; i++) {
    if (rangeBottomLine(ranges[i]) * lineHeight > viewportTop) {
      return i;
    }
  }

  return ranges.length - 1;
}

export function getScrollTopForDiff(range: BlockRange, lineHeight: number): number {
  return Math.max(0, rangeTopLine(range) * lineHeight - lineHeight);
}

export function getScrollTopForDiffInViewport(
  range: BlockRange,
  lineHeight: number,
  currentScrollTop: number,
  viewportHeight: number
): number {
  if (viewportHeight <= 0) {
    return getScrollTopForDiff(range, lineHeight);
  }

  const topLine = rangeTopLine(range);
  const bottomLine = rangeBottomLine(range);
  const viewportTop = currentScrollTop / lineHeight;
  const viewportBottom = (currentScrollTop + viewportHeight) / lineHeight;

  // Already fully visible: keep current scroll position to avoid jump.
  if (topLine >= viewportTop && bottomLine <= viewportBottom) {
    return currentScrollTop;
  }

  // Target is above viewport.
  if (topLine < viewportTop) {
    return Math.max(0, topLine * lineHeight - lineHeight);
  }

  // Target is below viewport.
  return Math.max(0, bottomLine * lineHeight - viewportHeight);
}
