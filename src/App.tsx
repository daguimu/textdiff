import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check } from 'lucide-react';
import { Header } from './components/Header';
import { EditorPanel, type EditorPanelHandle, LINE_HEIGHT } from './components/EditorPanel';
import { MergeGutter, GUTTER_WIDTH } from './components/MergeGutter';
import { ExportBar } from './components/ExportBar';
import { useTheme } from './hooks/useTheme';
import { useLocale } from './hooks/useLocale';
import { useDiff } from './hooks/useDiff';
import { computeAnnotations } from './utils/annotations';
import { appendSnapshot, type Snapshot } from './utils/history';
import { replaceLineRange, sliceLineRange } from './utils/textLines';
import { normalizeLineEndings, type LineEnding } from './utils/lineEndings';
import {
  findCurrentDiffIndex,
  getScrollTopForDiffInViewport,
} from './utils/diffNavigation';

function PanelLabel({
  label,
  clearLabel,
  onClear,
  disabled,
  text,
  copyTitle,
}: {
  label: string;
  clearLabel: string;
  onClear: () => void;
  disabled: boolean;
  text: string;
  copyTitle: string;
}) {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      setCopied(false);
      timerRef.current = null;
    }, 1400);
  }, [text]);

  return (
    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500" style={{ paddingLeft: 52 }}>
      {label}
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          disabled={!text}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
            copied
              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
              : 'border-gray-200 dark:border-base-200 bg-white dark:bg-base-100 text-gray-400 dark:text-gray-500 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 dark:hover:text-blue-400 dark:hover:border-blue-900/40 dark:hover:bg-blue-900/20'
          }`}
          title={copyTitle}
          aria-label={copyTitle}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? t.copied : t.copy}
        </button>
        <button
          onClick={onClear}
          disabled={disabled}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-gray-200 dark:border-base-200 bg-white dark:bg-base-100 text-gray-400 dark:text-gray-500 text-[11px] font-medium cursor-pointer hover:text-red-500 hover:border-red-200 hover:bg-red-50 dark:hover:text-red-400 dark:hover:border-red-900/40 dark:hover:bg-red-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-white disabled:hover:border-gray-200"
          title={t.clear}
          aria-label={t.clear}
        >
          <X size={12} strokeWidth={2.5} />
          {clearLabel}
        </button>
      </div>
    </div>
  );
}

const SAMPLE_LEFT = `function greet(name) {
  console.log("Hello, " + name);
  return true;
}

const users = ["Alice", "Bob", "Charlie"];

for (let i = 0; i < users.length; i++) {
  greet(users[i]);
}`;

const SAMPLE_RIGHT = `function greet(name, greeting = "Hello") {
  console.log(greeting + ", " + name + "!");
  return true;
}

const users = ["Alice", "Bob", "Charlie", "Diana"];

for (const user of users) {
  greet(user);
}

console.log("Done greeting everyone!");`;

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [downloadLineEnding, setDownloadLineEnding] = useState<LineEnding>('lf');

  const leftRef = useRef<EditorPanelHandle>(null);
  const rightRef = useRef<EditorPanelHandle>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const scrollSource = useRef<'left' | 'right' | null>(null);

  const editTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editGroupOpenRef = useRef(false);

  const closeEditGroup = useCallback(() => {
    editGroupOpenRef.current = false;
    if (editTimerRef.current) {
      clearTimeout(editTimerRef.current);
      editTimerRef.current = null;
    }
  }, []);

  const pushHistorySnapshot = useCallback((snapshot: Snapshot) => {
    setHistory((h) =>
      appendSnapshot(h, {
        left: normalizeLineEndings(snapshot.left),
        right: normalizeLineEndings(snapshot.right),
      })
    );
  }, []);

  const pushEditSnapshot = useCallback(
    (curLeft: string, curRight: string) => {
      if (!editGroupOpenRef.current) {
        editGroupOpenRef.current = true;
        pushHistorySnapshot({ left: curLeft, right: curRight });
      }
      if (editTimerRef.current) clearTimeout(editTimerRef.current);
      editTimerRef.current = setTimeout(() => {
        editGroupOpenRef.current = false;
        editTimerRef.current = null;
      }, 1000);
    },
    [pushHistorySnapshot]
  );

  const { blocks, stats } = useDiff(leftText, rightText);

  const { left: leftAnnotations, right: rightAnnotations, ranges } = useMemo(
    () => computeAnnotations(blocks),
    [blocks]
  );

  const totalChanges = ranges.length;
  const [selectedDiffIdx, setSelectedDiffIdx] = useState(-1);

  const visibleDiffIdx = useMemo(() => {
    return findCurrentDiffIndex(ranges, scrollTop, LINE_HEIGHT);
  }, [ranges, scrollTop]);

  const currentDiffIdx = useMemo(() => {
    if (ranges.length === 0) return -1;
    if (selectedDiffIdx < 0 || selectedDiffIdx >= ranges.length) {
      return visibleDiffIdx;
    }
    return selectedDiffIdx;
  }, [ranges.length, selectedDiffIdx, visibleDiffIdx]);

  const activeBlockId = useMemo(() => {
    if (currentDiffIdx < 0 || currentDiffIdx >= ranges.length) return null;
    return ranges[currentDiffIdx].blockId;
  }, [currentDiffIdx, ranges]);

  const scrollToDiff = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= ranges.length) return;
      const current = leftRef.current?.getScrollTop() ?? scrollTop;
      const viewportH = editorContainerRef.current?.clientHeight ?? 0;
      const targetScroll = getScrollTopForDiffInViewport(
        ranges[idx],
        LINE_HEIGHT,
        current,
        viewportH
      );
      if (targetScroll === current) return;
      leftRef.current?.setScrollTop(targetScroll);
      rightRef.current?.setScrollTop(targetScroll);
      setScrollTop(targetScroll);
    },
    [ranges, scrollTop]
  );

  const handleNextDiff = useCallback(() => {
    if (ranges.length === 0) return;
    const nextIdx = currentDiffIdx < 0 ? 0 : currentDiffIdx + 1;
    if (nextIdx < ranges.length) {
      setSelectedDiffIdx(nextIdx);
      scrollToDiff(nextIdx);
    }
  }, [ranges, currentDiffIdx, scrollToDiff]);

  const handlePrevDiff = useCallback(() => {
    if (ranges.length === 0) return;
    if (currentDiffIdx <= 0) return;
    const prevIdx = currentDiffIdx - 1;
    setSelectedDiffIdx(prevIdx);
    scrollToDiff(prevIdx);
  }, [ranges, currentDiffIdx, scrollToDiff]);

  const handleUndo = useCallback(() => {
    closeEditGroup();
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setLeftText(normalizeLineEndings(last.left));
      setRightText(normalizeLineEndings(last.right));
      return prev.slice(0, -1);
    });
  }, [closeEditGroup]);

  useEffect(() => {
    return () => {
      if (editTimerRef.current) {
        clearTimeout(editTimerRef.current);
        editTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isEditorFocused =
        active instanceof Element &&
        editorContainerRef.current?.contains(active);

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isEditorFocused) return;
        e.preventDefault();
        handleUndo();
        return;
      }

      if (e.key === 'F7') {
        if (!isEditorFocused) return;
        e.preventDefault();
        if (e.shiftKey) handlePrevDiff();
        else handleNextDiff();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleNextDiff, handlePrevDiff]);

  const handleLeftChange = useCallback(
    (newText: string) => {
      const normalized = normalizeLineEndings(newText);
      if (normalized === leftText) return;
      pushEditSnapshot(leftText, rightText);
      setLeftText(normalized);
    },
    [leftText, rightText, pushEditSnapshot]
  );

  const handleRightChange = useCallback(
    (newText: string) => {
      const normalized = normalizeLineEndings(newText);
      if (normalized === rightText) return;
      pushEditSnapshot(leftText, rightText);
      setRightText(normalized);
    },
    [leftText, rightText, pushEditSnapshot]
  );

  const handleAcceptLeft = useCallback(
    (blockId: number) => {
      const range = ranges.find((r) => r.blockId === blockId);
      if (!range) return;
      closeEditGroup();
      pushHistorySnapshot({ left: leftText, right: rightText });
      const blockLines = sliceLineRange(leftText, range.leftStart, range.leftCount);
      setRightText((current) =>
        replaceLineRange(current, range.rightStart, range.rightCount, blockLines)
      );
    },
    [ranges, leftText, rightText, closeEditGroup, pushHistorySnapshot]
  );

  const handleAcceptRight = useCallback(
    (blockId: number) => {
      const range = ranges.find((r) => r.blockId === blockId);
      if (!range) return;
      closeEditGroup();
      pushHistorySnapshot({ left: leftText, right: rightText });
      const blockLines = sliceLineRange(rightText, range.rightStart, range.rightCount);
      setLeftText((current) =>
        replaceLineRange(current, range.leftStart, range.leftCount, blockLines)
      );
    },
    [ranges, leftText, rightText, closeEditGroup, pushHistorySnapshot]
  );

  const handleAcceptAllLeft = useCallback(() => {
    if (leftText === rightText) return;
    closeEditGroup();
    pushHistorySnapshot({ left: leftText, right: rightText });
    setRightText(leftText);
  }, [leftText, rightText, closeEditGroup, pushHistorySnapshot]);

  const handleAcceptAllRight = useCallback(() => {
    if (leftText === rightText) return;
    closeEditGroup();
    pushHistorySnapshot({ left: leftText, right: rightText });
    setLeftText(rightText);
  }, [leftText, rightText, closeEditGroup, pushHistorySnapshot]);

  const handleClearLeft = useCallback(() => {
    if (!leftText) return;
    closeEditGroup();
    pushHistorySnapshot({ left: leftText, right: rightText });
    setLeftText('');
  }, [leftText, rightText, closeEditGroup, pushHistorySnapshot]);

  const handleClearRight = useCallback(() => {
    if (!rightText) return;
    closeEditGroup();
    pushHistorySnapshot({ left: leftText, right: rightText });
    setRightText('');
  }, [leftText, rightText, closeEditGroup, pushHistorySnapshot]);

  const loadSample = useCallback(() => {
    closeEditGroup();
    pushHistorySnapshot({ left: leftText, right: rightText });
    setLeftText(normalizeLineEndings(SAMPLE_LEFT));
    setRightText(normalizeLineEndings(SAMPLE_RIGHT));
  }, [leftText, rightText, closeEditGroup, pushHistorySnapshot]);

  const handleLeftScroll = useCallback((st: number) => {
    if (scrollSource.current === 'right') return;
    scrollSource.current = 'left';
    setScrollTop(st);
    setSelectedDiffIdx(findCurrentDiffIndex(ranges, st, LINE_HEIGHT));
    rightRef.current?.setScrollTop(st);
    requestAnimationFrame(() => {
      scrollSource.current = null;
    });
  }, [ranges]);

  const handleRightScroll = useCallback((st: number) => {
    if (scrollSource.current === 'left') return;
    scrollSource.current = 'right';
    setScrollTop(st);
    setSelectedDiffIdx(findCurrentDiffIndex(ranges, st, LINE_HEIGHT));
    leftRef.current?.setScrollTop(st);
    requestAnimationFrame(() => {
      scrollSource.current = null;
    });
  }, [ranges]);

  return (
    <div className="h-screen bg-[#FAFBFC] dark:bg-[#1d232a] p-3 md:p-4 transition-colors duration-200">
      <motion.div
        className="h-full flex flex-col bg-white dark:bg-base-100 rounded-2xl shadow-sm border border-gray-100 dark:border-base-200 overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <Header
          theme={theme}
          onToggleTheme={toggleTheme}
          onLoadSample={loadSample}
          stats={stats}
          totalChanges={totalChanges}
          onAcceptAllLeft={handleAcceptAllLeft}
          onAcceptAllRight={handleAcceptAllRight}
          onUndo={handleUndo}
          canUndo={history.length > 0}
          onPrevDiff={handlePrevDiff}
          onNextDiff={handleNextDiff}
          currentDiffIdx={currentDiffIdx}
        />

        {/* Panel labels */}
        <div className="flex shrink-0 border-b border-gray-100 dark:border-base-200 bg-gray-50/60 dark:bg-base-200/40">
          <PanelLabel
            label={t.original}
            clearLabel={t.clear}
            onClear={handleClearLeft}
            disabled={!leftText}
            text={leftText}
            copyTitle={t.copyOriginal}
          />
          <div
            className="border-l border-r border-gray-100 dark:border-base-200"
            style={{
              width: GUTTER_WIDTH,
              minWidth: GUTTER_WIDTH,
              background: 'var(--diff-gutter-bg)',
            }}
          />
          <PanelLabel
            label={t.modified}
            clearLabel={t.clear}
            onClear={handleClearRight}
            disabled={!rightText}
            text={rightText}
            copyTitle={t.copyModified}
          />
        </div>

        {/* Editors */}
        <div ref={editorContainerRef} className="flex flex-1 min-h-0">
          <EditorPanel
            ref={leftRef}
            text={leftText}
            onChange={handleLeftChange}
            annotations={leftAnnotations}
            activeBlockId={activeBlockId}
            placeholder={t.placeholderLeft}
            onScroll={handleLeftScroll}
          />

          <MergeGutter
            ranges={ranges}
            scrollTop={scrollTop}
            activeBlockId={activeBlockId}
            onAcceptLeft={handleAcceptLeft}
            onAcceptRight={handleAcceptRight}
          />

          <EditorPanel
            ref={rightRef}
            text={rightText}
            onChange={handleRightChange}
            annotations={rightAnnotations}
            activeBlockId={activeBlockId}
            placeholder={t.placeholderRight}
            onScroll={handleRightScroll}
          />
        </div>

        <ExportBar
          leftText={leftText}
          rightText={rightText}
          stats={stats}
          downloadLineEnding={downloadLineEnding}
          onDownloadLineEndingChange={setDownloadLineEnding}
        />
      </motion.div>
    </div>
  );
}
