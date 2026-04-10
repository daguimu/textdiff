import { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import { convertLineEndings, type LineEnding } from '../utils/lineEndings';
import type { DiffStats } from '../types/diff';

interface ExportBarProps {
  leftText: string;
  rightText: string;
  stats: DiffStats;
  downloadLineEnding: LineEnding;
  onDownloadLineEndingChange: (lineEnding: LineEnding) => void;
}

function useCopy() {
  const [copied, setCopied] = useState<'left' | 'right' | null>(null);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, []);

  const copy = useCallback(async (text: string, side: 'left' | 'right') => {
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
    setCopied(side);
    if (resetTimerRef.current !== null) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => {
      setCopied(null);
      resetTimerRef.current = null;
    }, 2000);
  }, []);

  return { copied, copy };
}

function download(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function ActionBtn({
  onClick,
  children,
  success,
}: {
  onClick: () => void;
  children: React.ReactNode;
  success?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
        success
          ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40'
          : 'bg-gray-100 dark:bg-base-200 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-base-200 hover:bg-gray-200 dark:hover:bg-base-300 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

export function ExportBar({
  leftText,
  rightText,
  stats,
  downloadLineEnding,
  onDownloadLineEndingChange,
}: ExportBarProps) {
  const { t } = useLocale();
  const { copied, copy } = useCopy();

  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-100 dark:border-base-200 bg-gray-50/60 dark:bg-base-200/30 shrink-0 gap-2 flex-wrap">
      <span className="text-xs text-gray-400 dark:text-gray-500">
        {stats.filesChanged === 0
          ? t.noChanges
          : t.statsText(stats.filesChanged, stats.insertions, stats.deletions)}
      </span>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <label className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mr-1">
          <span>{t.lineEndings}</span>
          <select
            value={downloadLineEnding}
            onChange={(e) =>
              onDownloadLineEndingChange(e.target.value as LineEnding)
            }
            className="h-7 min-w-[72px] px-2 rounded-lg border border-gray-200 dark:border-base-200 bg-white dark:bg-base-200 text-gray-600 dark:text-gray-400 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            aria-label={t.lineEndings}
          >
            <option value="lf">LF</option>
            <option value="crlf">CRLF</option>
          </select>
        </label>

        <ActionBtn onClick={() => copy(leftText, 'left')} success={copied === 'left'}>
          {copied === 'left' ? <Check size={16} /> : <Copy size={16} />}
          {copied === 'left' ? t.copiedBang : t.copyLeft}
        </ActionBtn>
        <ActionBtn onClick={() => copy(rightText, 'right')} success={copied === 'right'}>
          {copied === 'right' ? <Check size={16} /> : <Copy size={16} />}
          {copied === 'right' ? t.copiedBang : t.copyRight}
        </ActionBtn>
        <ActionBtn
          onClick={() =>
            download(
              convertLineEndings(rightText, downloadLineEnding),
              'result.txt'
            )
          }
        >
          <Download size={16} />
          {t.download}
        </ActionBtn>
      </div>
    </div>
  );
}
