import {
  forwardRef,
  useRef,
  useCallback,
  useImperativeHandle,
  useEffect,
  useState,
} from 'react';
import type { InlineChange } from '../types/diff';
import type { LineAnnotation } from '../utils/annotations';

const LINE_HEIGHT = 22;
const FONT =
  "ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace";
const FONT_SIZE = 13;
const PAD_LEFT = 12;
const MARKER_WIDTH = 3;

function getLineBg(type: string): string {
  switch (type) {
    case 'added':
      return 'var(--diff-added-bg)';
    case 'removed':
      return 'var(--diff-removed-bg)';
    case 'modified':
      return 'var(--diff-modified-bg)';
    default:
      return 'transparent';
  }
}

function getMarkerColor(type: string): string | null {
  switch (type) {
    case 'added':
      return 'var(--diff-added-marker)';
    case 'removed':
      return 'var(--diff-removed-marker)';
    case 'modified':
      return 'var(--diff-modified-marker)';
    default:
      return null;
  }
}

function getBlockBoundary(
  annotations: LineAnnotation[],
  i: number
): { isFirst: boolean; isLast: boolean } {
  const ann = annotations[i];
  if (!ann || ann.type === 'unchanged') return { isFirst: false, isLast: false };
  const prev = annotations[i - 1];
  const next = annotations[i + 1];
  return {
    isFirst: !prev || prev.blockId !== ann.blockId,
    isLast: !next || next.blockId !== ann.blockId,
  };
}

function blockBorderShadow(type: string, isFirst: boolean, isLast: boolean): string | undefined {
  if (!isFirst && !isLast) return undefined;
  const color =
    type === 'added'
      ? 'rgba(46,160,67,0.22)'
      : type === 'removed'
        ? 'rgba(248,81,73,0.22)'
        : 'rgba(210,153,34,0.22)';
  const parts: string[] = [];
  if (isFirst) parts.push(`inset 0 1px 0 0 ${color}`);
  if (isLast) parts.push(`inset 0 -1px 0 0 ${color}`);
  return parts.join(', ');
}

function mergeShadows(...shadows: Array<string | undefined>): string | undefined {
  const parts = shadows.filter((shadow): shadow is string => Boolean(shadow));
  return parts.length > 0 ? parts.join(', ') : undefined;
}

const TEXT_SHARED: React.CSSProperties = {
  fontFamily: FONT,
  fontSize: FONT_SIZE,
  lineHeight: `${LINE_HEIGHT}px`,
  tabSize: 4,
  letterSpacing: 'normal',
  wordSpacing: 'normal',
};

function InlineSpan({ changes }: { changes: InlineChange[] }) {
  return (
    <>
      {changes.map((c, i) => (
        <span
          key={i}
          style={
            c.type !== 'unchanged'
              ? {
                  backgroundColor:
                    c.type === 'added'
                      ? 'var(--diff-added-inline)'
                      : 'var(--diff-removed-inline)',
                  borderRadius: 4,
                  padding: '2px 1px',
                }
              : undefined
          }
        >
          {c.value}
        </span>
      ))}
    </>
  );
}

export interface EditorPanelHandle {
  getScrollTop: () => number;
  setScrollTop: (v: number) => void;
}

interface EditorPanelProps {
  text: string;
  onChange: (text: string) => void;
  annotations: LineAnnotation[];
  activeBlockId?: number | null;
  placeholder: string;
  onScroll?: (scrollTop: number) => void;
}

export const EditorPanel = forwardRef<EditorPanelHandle, EditorPanelProps>(
  function EditorPanel(
    {
      text,
      onChange,
      annotations,
      activeBlockId = null,
      placeholder,
      onScroll,
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);
    const lineNumRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    const syncLayers = useCallback((scrollTop: number) => {
      const sl = textareaRef.current?.scrollLeft ?? 0;
      if (highlightRef.current) {
        highlightRef.current.style.transform = `translate(${-sl}px, ${-scrollTop}px)`;
      }
      if (lineNumRef.current) {
        lineNumRef.current.style.transform = `translateY(${-scrollTop}px)`;
      }
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getScrollTop: () => textareaRef.current?.scrollTop ?? 0,
        setScrollTop: (v: number) => {
          if (textareaRef.current) textareaRef.current.scrollTop = v;
          syncLayers(v);
        },
      }),
      [syncLayers]
    );

    const handleScroll = useCallback(() => {
      const el = textareaRef.current;
      if (!el) return;
      syncLayers(el.scrollTop);
      onScroll?.(el.scrollTop);
    }, [syncLayers, onScroll]);

    useEffect(() => {
      syncLayers(textareaRef.current?.scrollTop ?? 0);
    }, [syncLayers]);

    const lines = text ? text.split('\n') : [''];

    return (
      <div
        className={`relative flex flex-1 min-w-0 bg-white dark:bg-base-100 transition-shadow duration-200 ${
          isFocused
            ? 'z-2 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.3),0_0_0_3px_rgba(59,130,246,0.08)]'
            : ''
        }`}
      >
        {/* Line numbers column */}
        <div className="shrink-0 overflow-hidden select-none" style={{ width: 48 }}>
          <div ref={lineNumRef}>
            {lines.map((_, i) => {
              const ann = annotations[i];
              const isChanged = ann && ann.type !== 'unchanged';
              const isActive = Boolean(
                isChanged && activeBlockId !== null && ann.blockId === activeBlockId
              );
              const marker = isChanged ? getMarkerColor(ann.type) : null;
              const { isFirst, isLast } = getBlockBoundary(annotations, i);
              const shadow = isChanged
                ? blockBorderShadow(ann.type, isFirst, isLast)
                : undefined;
              return (
                <div
                  key={i}
                  style={{
                    height: LINE_HEIGHT,
                    lineHeight: `${LINE_HEIGHT}px`,
                    display: 'flex',
                    alignItems: 'stretch',
                  }}
                >
                  {/* Soft color marker bar */}
                  <div
                    style={{
                      width: MARKER_WIDTH,
                      minWidth: MARKER_WIDTH,
                      backgroundColor: marker ?? 'transparent',
                      borderRadius: isFirst && isLast ? 2 : isFirst ? '2px 2px 0 0' : isLast ? '0 0 2px 2px' : 0,
                    }}
                  />
                  {/* Number */}
                  <div
                    style={{
                      flex: 1,
                      textAlign: 'right',
                      paddingRight: 10,
                      paddingLeft: 4,
                      fontSize: 11,
                      fontFamily: FONT,
                      color: isChanged
                        ? 'var(--text-secondary)'
                        : 'var(--diff-line-number)',
                      backgroundColor: isChanged
                        ? getLineBg(ann.type)
                        : 'transparent',
                      borderRight: '1px solid var(--surface-border)',
                      boxShadow: mergeShadows(
                        shadow,
                        isActive ? 'inset 0 0 0 9999px var(--diff-active-ring)' : undefined
                      ),
                    }}
                  >
                    {i + 1}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="relative flex-1 min-w-0 overflow-hidden">
          {/* Highlight layer */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <div ref={highlightRef}>
              {lines.map((line, i) => {
                const ann = annotations[i];
                const isChanged = ann && ann.type !== 'unchanged';
                const isActive = Boolean(
                  isChanged && activeBlockId !== null && ann.blockId === activeBlockId
                );
                const bg = isChanged ? getLineBg(ann.type) : 'transparent';
                const { isFirst, isLast } = getBlockBoundary(annotations, i);
                const shadow = isChanged
                  ? blockBorderShadow(ann.type, isFirst, isLast)
                  : undefined;
                return (
                  <div
                    key={i}
                    className="whitespace-pre"
                    style={{
                      ...TEXT_SHARED,
                      height: LINE_HEIGHT,
                      minWidth: '100%',
                      backgroundColor: bg,
                      paddingLeft: PAD_LEFT,
                      paddingRight: PAD_LEFT,
                      color: 'var(--text-primary)',
                      boxShadow: mergeShadows(
                        shadow,
                        isActive ? 'inset 0 0 0 9999px var(--diff-active-ring)' : undefined
                      ),
                    }}
                  >
                    {ann?.inlineChanges ? (
                      <InlineSpan changes={ann.inlineChanges} />
                    ) : (
                      line || '\u00A0'
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-label={placeholder}
            spellCheck={false}
            className="absolute inset-0 w-full h-full resize-none outline-none border-0 whitespace-pre"
            style={{
              ...TEXT_SHARED,
              paddingLeft: PAD_LEFT,
              paddingRight: PAD_LEFT,
              paddingTop: 0,
              paddingBottom: 0,
              margin: 0,
              background: 'transparent',
              color: 'transparent',
              caretColor: 'var(--text-primary)',
              WebkitTextFillColor: 'transparent',
              overflowWrap: 'normal',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    );
  }
);

export { LINE_HEIGHT };
