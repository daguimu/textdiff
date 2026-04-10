import type { DiffBlock, InlineChange } from '../types/diff.js';

export interface LineAnnotation {
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  inlineChanges?: InlineChange[];
  blockId: number;
}

export interface BlockRange {
  blockId: number;
  type: 'added' | 'removed' | 'modified';
  leftStart: number;
  leftCount: number;
  rightStart: number;
  rightCount: number;
}

export function computeAnnotations(blocks: DiffBlock[]): {
  left: LineAnnotation[];
  right: LineAnnotation[];
  ranges: BlockRange[];
} {
  const left: LineAnnotation[] = [];
  const right: LineAnnotation[] = [];
  const ranges: BlockRange[] = [];

  for (const block of blocks) {
    const leftStart = left.length;
    const rightStart = right.length;
    let leftCount = 0;
    let rightCount = 0;

    for (const line of block.leftLines) {
      if (!line.isPadding) {
        left.push({
          type: block.type === 'unchanged' ? 'unchanged' : line.type,
          inlineChanges: line.inlineChanges,
          blockId: block.id,
        });
        leftCount++;
      }
    }

    for (const line of block.rightLines) {
      if (!line.isPadding) {
        right.push({
          type: block.type === 'unchanged' ? 'unchanged' : line.type,
          inlineChanges: line.inlineChanges,
          blockId: block.id,
        });
        rightCount++;
      }
    }

    if (block.type !== 'unchanged') {
      ranges.push({
        blockId: block.id,
        type: block.type as 'added' | 'removed' | 'modified',
        leftStart,
        leftCount,
        rightStart,
        rightCount,
      });
    }
  }

  return { left, right, ranges };
}
