import { diffLines, diffWordsWithSpace, type Change } from 'diff';
import type { DiffBlock, DiffLine, InlineChange, DiffStats } from '../types/diff.js';
import { normalizeLineEndings } from './lineEndings.js';

function computeInlineChanges(
  oldLine: string,
  newLine: string
): { left: InlineChange[]; right: InlineChange[] } {
  const parts = diffWordsWithSpace(oldLine, newLine);
  const left: InlineChange[] = [];
  const right: InlineChange[] = [];

  for (const part of parts) {
    if (part.removed) {
      left.push({ value: part.value, type: 'removed' });
    } else if (part.added) {
      right.push({ value: part.value, type: 'added' });
    } else {
      left.push({ value: part.value, type: 'unchanged' });
      right.push({ value: part.value, type: 'unchanged' });
    }
  }

  return { left, right };
}

function splitLines(value: string): string[] {
  const lines = value.split('\n');
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop();
  }
  return lines;
}

export function computeDiff(leftText: string, rightText: string): DiffBlock[] {
  const normalizedLeft = normalizeLineEndings(leftText);
  const normalizedRight = normalizeLineEndings(rightText);

  const changes: Change[] = diffLines(normalizedLeft, normalizedRight);
  const blocks: DiffBlock[] = [];
  let blockId = 0;
  let leftLineNum = 1;
  let rightLineNum = 1;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      // Unchanged block
      const lines = splitLines(change.value);
      const leftLines: DiffLine[] = [];
      const rightLines: DiffLine[] = [];

      for (const line of lines) {
        leftLines.push({
          lineNumber: leftLineNum,
          content: line,
          type: 'unchanged',
        });
        rightLines.push({
          lineNumber: rightLineNum,
          content: line,
          type: 'unchanged',
        });
        leftLineNum++;
        rightLineNum++;
      }

      blocks.push({ id: blockId++, type: 'unchanged', leftLines, rightLines });
      i++;
    } else if (
      change.removed &&
      i + 1 < changes.length &&
      changes[i + 1].added
    ) {
      // Modified block: removed followed by added
      const removedLines = splitLines(change.value);
      const addedLines = splitLines(changes[i + 1].value);
      const maxLen = Math.max(removedLines.length, addedLines.length);
      const leftLines: DiffLine[] = [];
      const rightLines: DiffLine[] = [];

      for (let j = 0; j < maxLen; j++) {
        const hasLeft = j < removedLines.length;
        const hasRight = j < addedLines.length;

        if (hasLeft && hasRight) {
          const { left: leftInline, right: rightInline } =
            computeInlineChanges(removedLines[j], addedLines[j]);

          leftLines.push({
            lineNumber: leftLineNum,
            content: removedLines[j],
            type: 'modified',
            inlineChanges: leftInline,
          });
          rightLines.push({
            lineNumber: rightLineNum,
            content: addedLines[j],
            type: 'modified',
            inlineChanges: rightInline,
          });
          leftLineNum++;
          rightLineNum++;
        } else if (hasLeft) {
          leftLines.push({
            lineNumber: leftLineNum,
            content: removedLines[j],
            type: 'removed',
          });
          rightLines.push({
            lineNumber: null,
            content: '',
            type: 'removed',
            isPadding: true,
          });
          leftLineNum++;
        } else {
          leftLines.push({
            lineNumber: null,
            content: '',
            type: 'added',
            isPadding: true,
          });
          rightLines.push({
            lineNumber: rightLineNum,
            content: addedLines[j],
            type: 'added',
          });
          rightLineNum++;
        }
      }

      blocks.push({ id: blockId++, type: 'modified', leftLines, rightLines });
      i += 2;
    } else if (change.removed) {
      // Pure removal
      const lines = splitLines(change.value);
      const leftLines: DiffLine[] = [];
      const rightLines: DiffLine[] = [];

      for (const line of lines) {
        leftLines.push({
          lineNumber: leftLineNum,
          content: line,
          type: 'removed',
        });
        rightLines.push({
          lineNumber: null,
          content: '',
          type: 'removed',
          isPadding: true,
        });
        leftLineNum++;
      }

      blocks.push({ id: blockId++, type: 'removed', leftLines, rightLines });
      i++;
    } else if (change.added) {
      // Pure addition
      const lines = splitLines(change.value);
      const leftLines: DiffLine[] = [];
      const rightLines: DiffLine[] = [];

      for (const line of lines) {
        leftLines.push({
          lineNumber: null,
          content: '',
          type: 'added',
          isPadding: true,
        });
        rightLines.push({
          lineNumber: rightLineNum,
          content: line,
          type: 'added',
        });
        rightLineNum++;
      }

      blocks.push({ id: blockId++, type: 'added', leftLines, rightLines });
      i++;
    } else {
      i++;
    }
  }

  return blocks;
}

export function computeStats(blocks: DiffBlock[]): DiffStats {
  let insertions = 0;
  let deletions = 0;

  for (const block of blocks) {
    if (block.type === 'unchanged') continue;
    deletions += block.leftLines.filter((line) => !line.isPadding).length;
    insertions += block.rightLines.filter((line) => !line.isPadding).length;
  }

  return {
    filesChanged: insertions + deletions > 0 ? 1 : 0,
    insertions,
    deletions,
  };
}
