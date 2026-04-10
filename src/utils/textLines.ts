import { normalizeLineEndings } from './lineEndings.js';

const LOGICAL_LINE_REGEX = /[^\n]*\n|[^\n]+/g;

export function splitLogicalLines(text: string): string[] {
  if (!text) return [];
  const normalized = normalizeLineEndings(text);
  return normalized.match(LOGICAL_LINE_REGEX) ?? [];
}

export function sliceLineRange(
  text: string,
  start: number,
  count: number
): string[] {
  if (count <= 0) return [];
  return splitLogicalLines(text).slice(start, start + count);
}

export function replaceLineRange(
  text: string,
  start: number,
  count: number,
  replacement: readonly string[]
): string {
  const lines = splitLogicalLines(text);
  lines.splice(start, count, ...replacement);
  return lines.join('');
}
