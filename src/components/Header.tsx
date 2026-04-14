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
        bg-[#e8e6dc] dark:bg-[#30302e] text-[#4d4c48] dark:text-[#b0aea5]
        shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a]
        hover:bg-[#d1cfc5] dark:hover:bg-[#3d3d3a] hover:text-[#141413] dark:hover:text-[#faf9f5]
        focus-visible:ring-2 focus-visible:ring-[#3898ec]/40 focus-visible:outline-none
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
        bg-[#e8e6dc] dark:bg-[#30302e] text-[#c96442] dark:text-[#d97757]
        shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a]
        hover:bg-[#c96442]/10 dark:hover:bg-[#d97757]/10 hover:shadow-[0_0_0_1px_#c96442] dark:hover:shadow-[0_0_0_1px_#d97757]
        focus-visible:ring-2 focus-visible:ring-[#3898ec]/40 focus-visible:outline-none
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
    <header className="sticky top-0 z-50 shrink-0 px-4 py-2.5 bg-[#faf9f5] dark:bg-[var(--surface-card-dark)] border-b border-[#f0eee6] dark:border-[#30302e]">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Left: Brand + Controls */}
        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
          <div className="flex items-center gap-2 pr-2">
            <GitCompareArrows size={20} className="text-[#c96442]" />
            <span
              className="text-sm font-medium tracking-tight text-[#141413] dark:text-[#faf9f5]"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              TextDiff
            </span>
          </div>

          <div className="w-px h-5 mx-1 bg-[#e8e6dc] dark:bg-[#30302e] hidden sm:block" />

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

          <div className="w-px h-5 mx-1 bg-[#e8e6dc] dark:bg-[#30302e]" />

          <NavBtn
            onClick={onPrevDiff}
            disabled={!hasChanges || currentDiffIdx <= 0}
            title={t.prevDiff}
          >
            <ChevronUp size={16} />
          </NavBtn>
          <span
            className="text-xs font-medium min-w-[44px] text-center select-none text-[#5e5d59] dark:text-[#b0aea5]"
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
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[#e8e6dc] dark:bg-[#30302e] text-[#87867f] shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a]">
                {t.noChanges}
              </span>
            ) : (
              <>
                <span className="text-xs px-2.5 py-1 rounded-lg bg-[#e8e6dc] dark:bg-[#30302e] text-[#5e5d59] dark:text-[#b0aea5] shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a]">
                  {t.fileChanged(stats.filesChanged)}
                </span>
                {stats.insertions > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#3a9a5c]/10 text-[#3a9a5c] shadow-[0_0_0_1px_rgba(58,154,92,0.25)]">
                    <Plus size={16} />
                    {stats.insertions}
                  </span>
                )}
                {stats.deletions > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-[#b53333]/10 text-[#b53333] dark:text-[#e05555] shadow-[0_0_0_1px_rgba(181,51,51,0.25)]">
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
              bg-[#e8e6dc] dark:bg-[#30302e] text-[#5e5d59] dark:text-[#b0aea5]
              shadow-[0_0_0_1px_#d1cfc5] dark:shadow-[0_0_0_1px_#3d3d3a]
              hover:bg-[#d1cfc5] dark:hover:bg-[#3d3d3a] hover:text-[#141413] dark:hover:text-[#faf9f5]
              focus-visible:ring-2 focus-visible:ring-[#3898ec]/40 focus-visible:outline-none
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
              bg-[#e8e6dc] dark:bg-[#30302e] text-[#5e5d59] dark:text-[#b0aea5]
              hover:bg-[#d1cfc5] dark:hover:bg-[#3d3d3a] hover:text-[#141413] dark:hover:text-[#faf9f5]
              focus-visible:ring-2 focus-visible:ring-[#3898ec]/40 focus-visible:outline-none
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
