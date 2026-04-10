import { useMemo } from 'react';
import { computeDiff, computeStats } from '../utils/diffEngine';

export function useDiff(leftText: string, rightText: string) {
  const blocks = useMemo(
    () => computeDiff(leftText, rightText),
    [leftText, rightText]
  );

  const stats = useMemo(() => computeStats(blocks), [blocks]);

  return { blocks, stats };
}
