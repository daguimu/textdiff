import { useRef, useEffect } from 'react';
import { useLocale } from '../hooks/useLocale';
import type { BlockRange } from '../utils/annotations';
import { LINE_HEIGHT } from './EditorPanel';

export const GUTTER_WIDTH = 60;

interface MergeGutterProps {
  ranges: BlockRange[];
  scrollTop: number;
  activeBlockId?: number | null;
  onAcceptLeft: (blockId: number) => void;
  onAcceptRight: (blockId: number) => void;
}

function connectorPath(range: BlockRange, w: number): string {
  const lt = range.leftStart * LINE_HEIGHT;
  const lb = (range.leftStart + range.leftCount) * LINE_HEIGHT;
  const rt = range.rightStart * LINE_HEIGHT;
  const rb = (range.rightStart + range.rightCount) * LINE_HEIGHT;

  const cx1 = w * 0.3;
  const cx2 = w * 0.7;

  return [
    `M 0,${lt}`,
    `C ${cx1},${lt} ${cx2},${rt} ${w},${rt}`,
    `L ${w},${rb}`,
    `C ${cx2},${rb} ${cx1},${lb} 0,${lb}`,
    'Z',
  ].join(' ');
}

function getColor(type: string): string {
  switch (type) {
    case 'added':
      return 'var(--diff-added-marker)';
    case 'removed':
      return 'var(--diff-removed-marker)';
    case 'modified':
      return 'var(--diff-modified-marker)';
    default:
      return 'var(--diff-merge-btn)';
  }
}

function getTint(type: string): string {
  switch (type) {
    case 'added':
      return 'rgba(58,154,92,0.12)';
    case 'removed':
      return 'rgba(181,51,51,0.12)';
    case 'modified':
      return 'rgba(160,120,32,0.12)';
    default:
      return 'rgba(201,100,66,0.12)';
  }
}

function connectorEdges(range: BlockRange, w: number): { top: string; bottom: string } {
  const lt = range.leftStart * LINE_HEIGHT;
  const lb = (range.leftStart + range.leftCount) * LINE_HEIGHT;
  const rt = range.rightStart * LINE_HEIGHT;
  const rb = (range.rightStart + range.rightCount) * LINE_HEIGHT;
  const cx1 = w * 0.3;
  const cx2 = w * 0.7;
  return {
    top: `M 0,${lt} C ${cx1},${lt} ${cx2},${rt} ${w},${rt}`,
    bottom: `M 0,${lb} C ${cx1},${lb} ${cx2},${rb} ${w},${rb}`,
  };
}

export function MergeGutter({
  ranges,
  scrollTop,
  activeBlockId = null,
  onAcceptLeft,
  onAcceptRight,
}: MergeGutterProps) {
  const { t } = useLocale();
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.style.transform = `translateY(${-scrollTop}px)`;
    }
  }, [scrollTop]);

  let totalHeight = 0;
  if (ranges.length > 0) {
    const last = ranges[ranges.length - 1];
    const lastEnd = Math.max(
      (last.leftStart + last.leftCount) * LINE_HEIGHT,
      (last.rightStart + last.rightCount) * LINE_HEIGHT
    );
    totalHeight = lastEnd + 400;
  }

  return (
    <div
      className="shrink-0 overflow-hidden border-l border-r border-[#e8e6dc] dark:border-[#30302e]"
      style={{
        width: GUTTER_WIDTH,
        minWidth: GUTTER_WIDTH,
        background: 'var(--diff-gutter-bg)',
      }}
    >
      <div ref={innerRef} style={{ position: 'relative', height: totalHeight }}>
        {/* SVG connector shapes */}
        <svg
          width={GUTTER_WIDTH}
          height={totalHeight}
          style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
        >
          {ranges.map((range) => {
            const color = getColor(range.type);
            const isActive = activeBlockId !== null && range.blockId === activeBlockId;
            const edges = connectorEdges(range, GUTTER_WIDTH);
            return (
              <g key={range.blockId} opacity={isActive ? 1 : 0.9}>
                <path
                  d={connectorPath(range, GUTTER_WIDTH)}
                  fill={getTint(range.type)}
                />
                <path
                  d={edges.top}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.8}
                  strokeOpacity={isActive ? 0.4 : 0.18}
                />
                <path
                  d={edges.bottom}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.8}
                  strokeOpacity={isActive ? 0.4 : 0.18}
                />
              </g>
            );
          })}
        </svg>

        {/* Merge action buttons */}
        {ranges.map((range) => {
          const leftMid =
            (range.leftStart + range.leftCount / 2) * LINE_HEIGHT;
          const rightMid =
            (range.rightStart + range.rightCount / 2) * LINE_HEIGHT;
          const centerY = (leftMid + rightMid) / 2;

          return (
            <div
              key={range.blockId}
              className="absolute flex items-center gap-[6px]"
              style={{
                top: centerY - 11,
                left: '50%',
                transform: 'translateX(-50%)',
              }}
            >
              <button
                onClick={() => onAcceptLeft(range.blockId)}
                className="merge-dot-btn"
                title={t.acceptLeftToRight}
                aria-label={t.acceptLeftToRight}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5h6M5.5 2.5L8 5 5.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={() => onAcceptRight(range.blockId)}
                className="merge-dot-btn"
                title={t.acceptRightToLeft}
                aria-label={t.acceptRightToLeft}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M8 5H2M4.5 2.5L2 5l2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
