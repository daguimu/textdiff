import assert from 'node:assert/strict';
import test from 'node:test';
import {
  convertLineEndings,
  normalizeLineEndings,
} from '../src/utils/lineEndings.js';

test('normalizeLineEndings converts CRLF and CR to LF', () => {
  assert.equal(normalizeLineEndings('a\r\nb\rc\n'), 'a\nb\nc\n');
});

test('convertLineEndings converts LF text to CRLF', () => {
  assert.equal(convertLineEndings('a\nb\n', 'crlf'), 'a\r\nb\r\n');
});

test('convertLineEndings keeps LF when target is LF', () => {
  assert.equal(convertLineEndings('a\r\nb\r', 'lf'), 'a\nb\n');
});
