import { useState, useEffect } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import { WordInput } from './WordInput'
import { WeekSelector } from './WeekSelector'

export function WordListPanel() {
  const { rawText, weeks, currentWeek, currentWords } = useSpelling()
  const [collapsed, setCollapsed] = useState(false)
  const [animating, setAnimating] = useState(false)

  const hasLoadedWords = rawText.trim().length > 0 && currentWords.length > 0

  const collapse = () => {
    setAnimating(true)
    setTimeout(() => {
      setCollapsed(true)
      setAnimating(false)
    }, 350)
  }

  const expand = () => {
    setCollapsed(false)
  }

  useEffect(() => {
    if (!hasLoadedWords) setCollapsed(false)
  }, [hasLoadedWords])

  if (!hasLoadedWords) {
    return (
      <div className="shrink-0 space-y-3">
        <WordInput />
        <WeekSelector />
      </div>
    )
  }

  if (collapsed && !animating) {
    return (
      <div className="shrink-0 animate-pop">
        <div className="glass-card flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-text)]">
              {weeks.reduce((n, w) => n + w.words.length, 0)} words loaded
            </p>
            <p className="truncate text-xs text-[var(--color-text-muted)]">
              Week {currentWeek}
              {weeks.length > 1 ? ` of ${weeks.length}` : ''} · {currentWords.length} words this week
            </p>
          </div>
          {weeks.length > 1 && (
            <div className="hidden shrink-0 gap-1 sm:flex">
              {weeks.map((week) => (
                <WeekPill key={week.weekNumber} weekNumber={week.weekNumber} />
              ))}
            </div>
          )}
          <CollapseButton collapsed onClick={expand} />
        </div>
      </div>
    )
  }

  return (
    <div className={`shrink-0 collapse-panel ${animating ? 'is-collapsing' : ''}`}>
      <div className="shrink-0 collapse-panel-inner space-y-3">
        <WordInput collapseButton={<CollapseButton collapsed={false} onClick={collapse} />} />
        <WeekSelector />
      </div>
    </div>
  )
}

function WeekPill({ weekNumber }: { weekNumber: number }) {
  const { currentWeek, setCurrentWeek } = useSpelling()

  return (
    <button
      onClick={() => setCurrentWeek(weekNumber)}
      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
        currentWeek === weekNumber
          ? 'purple-gradient text-white'
          : 'border border-purple-500/20 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:border-purple-500/40 hover:text-[var(--color-text)]'
      }`}
    >
      W{weekNumber}
    </button>
  )
}

function CollapseButton({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={collapsed ? 'Show word list' : 'Hide word list'}
      title={collapsed ? 'Show word list' : 'Hide word list'}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] shadow-lg transition hover:border-purple-500/60 hover:bg-purple-600/20 hover:text-[var(--color-text)]"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}
