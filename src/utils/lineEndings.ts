export type LineEnding = 'lf' | 'crlf';

export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

export function convertLineEndings(text: string, lineEnding: LineEnding): string {
  const normalized = normalizeLineEndings(text);
  if (lineEnding === 'crlf') {
    return normalized.replace(/\n/g, '\r\n');
  }
  return normalized;
}
