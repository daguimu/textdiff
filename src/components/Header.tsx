import {
  Sun,
  Moon,
  GitCompareArrows,
  FileText,
  ChevronsRight,
  ChevronsLeft,
  Undo2,
  Plus,
  Minus,
  ChevronUp,
  ChevronDown,
  Languages,
} from 'lucide-react';
import { useLocale } from '../hooks/useLocale';
import type { DiffStats } from '../types/diff';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onLoadSample: () => void;
  stats: DiffStats;
  totalChanges: number;
  onAcceptAllLeft: () => void;
  onAcceptAllRight: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onPrevDiff: () => void;
  onNextDiff: () => void;
  currentDiffIdx: number;
}

function ToolbarBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
        bg-gray-100 dark:bg-base-200 text-gray-600 dark:text-gray-400
        border border-gray-200 dark:border-base-200
        hover:bg-gray-200 dark:hover:bg-base-300 hover:text-gray-800 dark:hover:text-gray-200
        transition-colors cursor-pointer
        disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function NavBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="flex items-center justify-center w-7 h-7 rounded-lg
        bg-gray-100 dark:bg-base-200 text-blue-500 dark:text-blue-400
        border border-gray-200 dark:border-base-200
        hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800
        transition-colors cursor-pointer
        disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

export function Header({
  theme,
  onToggleTheme,
  onLoadSample,
  stats,
  totalChanges,
  onAcceptAllLeft,
  onAcceptAllRight,
  onUndo,
  canUndo,
  onPrevDiff,
  onNextDiff,
  currentDiffIdx,
}: HeaderProps) {
  const { locale, toggleLocale, t } = useLocale();
  const hasChanges = totalChanges > 0;

  return (
    <header className="sticky top-0 z-50 shrink-0 px-4 py-2.5 bg-white dark:bg-base-100 border-b border-gray-100 dark:border-base-200">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Brand + Controls */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <div className="flex items-center gap-2 pr-2">
            <GitCompareArrows size={20} className="text-blue-500" />
            <span className="text-sm font-semibold tracking-tight text-gray-700 dark:text-gray-300">
              TextDiff
            </span>
          </div>

          <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-base-300 hidden sm:block" />

          <ToolbarBtn onClick={onLoadSample} title={t.loadSample}>
            <FileText size={16} />
            {t.sample}
          </ToolbarBtn>
          <ToolbarBtn
            onClick={onAcceptAllLeft}
            disabled={!hasChanges}
            title={t.acceptAllLeft}
          >
            <ChevronsRight size={16} />
            {t.allLeft}
          </ToolbarBtn>
          <ToolbarBtn
            onClick={onAcceptAllRight}
            disabled={!hasChanges}
            title={t.acceptAllRight}
          >
            <ChevronsLeft size={16} />
            {t.allRight}
          </ToolbarBtn>
          <ToolbarBtn onClick={onUndo} disabled={!canUndo} title={t.undo}>
            <Undo2 size={16} />
            {t.undo}
          </ToolbarBtn>

          <div className="w-px h-5 mx-1 bg-gray-200 dark:bg-base-300" />

          <NavBtn
            onClick={onPrevDiff}
            disabled={!hasChanges || currentDiffIdx <= 0}
            title={t.prevDiff}
          >
            <ChevronUp size={16} />
          </NavBtn>
          <span
            className="text-xs font-semibold min-w-[44px] text-center select-none text-gray-500 dark:text-gray-400"
            style={{ opacity: hasChanges ? 1 : 0.4 }}
          >
            {hasChanges
              ? `${currentDiffIdx >= 0 ? currentDiffIdx + 1 : '-'}/${totalChanges}`
              : '0/0'}
          </span>
          <NavBtn
            onClick={onNextDiff}
            disabled={!hasChanges || currentDiffIdx >= totalChanges - 1}
            title={t.nextDiff}
          >
            <ChevronDown size={16} />
          </NavBtn>
        </div>

        {/* Right: Stats + Lang + Theme */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          <div className="flex items-center gap-1.5">
            {stats.filesChanged === 0 ? (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-base-200 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-base-200">
                {t.noChanges}
              </span>
            ) : (
              <>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-base-200 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-base-200">
                  {t.fileChanged(stats.filesChanged)}
                </span>
                {stats.insertions > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    <Plus size={16} />
                    {stats.insertions}
                  </span>
                )}
                {stats.deletions > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-red-900/30">
                    <Minus size={16} />
                    {stats.deletions}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Language toggle */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              bg-gray-100 dark:bg-base-200 text-gray-500 dark:text-gray-400
              border border-gray-200 dark:border-base-200
              hover:bg-gray-200 dark:hover:bg-base-300 hover:text-gray-700 dark:hover:text-gray-200
              transition-colors cursor-pointer"
            title={locale === 'en' ? '切换到中文' : 'Switch to English'}
          >
            <Languages size={14} />
            {locale === 'en' ? '中文' : 'EN'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-gray-100 dark:bg-base-200 text-gray-500 dark:text-gray-400
              hover:bg-gray-200 dark:hover:bg-base-100 hover:text-gray-700 dark:hover:text-gray-200
              transition-colors cursor-pointer"
            title={theme === 'light' ? t.darkMode : t.lightMode}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
