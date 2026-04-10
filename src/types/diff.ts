export interface InlineChange {
  value: string;
  type: 'unchanged' | 'added' | 'removed';
}

export interface DiffLine {
  lineNumber: number | null;
  content: string;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  inlineChanges?: InlineChange[];
  isPadding?: boolean;
}

export interface DiffBlock {
  id: number;
  type: 'unchanged' | 'added' | 'removed' | 'modified';
  leftLines: DiffLine[];
  rightLines: DiffLine[];
}

export type MergeDecision = 'accept-left' | 'accept-right' | 'pending';

export interface DiffStats {
  filesChanged: number;
  insertions: number;
  deletions: number;
}
