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
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#3898ec]/40 focus-visible:outline-none ${
        success
          ? 'bg-[#3a9a5c]/10 text-[#3a9a5c] shadow-[0_0_0_1px_rgba(58,154,92,0.25)]'
          : 'bg-[#e8e6dc] dark:bg-[#30302e] text-[#4d4c48] dark:text-[#b0aea5] shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a] hover:bg-[#d1cfc5] dark:hover:bg-[#3d3d3a] hover:text-[#141413] dark:hover:text-[#faf9f5]'
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
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#f0eee6] dark:border-[#30302e] bg-[#f5f4ed]/60 dark:bg-[#141413]/30 shrink-0 gap-2 flex-wrap">
      <span className="text-xs text-[#87867f]">
        {stats.filesChanged === 0
          ? t.noChanges
          : t.statsText(stats.filesChanged, stats.insertions, stats.deletions)}
      </span>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <label className="flex items-center gap-2 text-xs text-[#87867f] mr-1">
          <span>{t.lineEndings}</span>
          <select
            value={downloadLineEnding}
            onChange={(e) =>
              onDownloadLineEndingChange(e.target.value as LineEnding)
            }
            className="h-7 min-w-[72px] px-2 rounded-lg border border-[#e8e6dc] dark:border-[#30302e] bg-[#faf9f5] dark:bg-[var(--surface-card-dark)] text-[#4d4c48] dark:text-[#b0aea5] text-xs outline-none focus-visible:border-[#3898ec] focus-visible:ring-2 focus-visible:ring-[#3898ec]/20 transition-all"
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
