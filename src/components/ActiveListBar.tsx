import { useSpelling } from '../hooks/useSpellingStore'

export function ActiveListBar() {
  const { rawText, weeks, currentWeek, setCurrentWeek, currentWords, wordsPerWeek } = useSpelling()

  const totalWords = weeks.reduce((n, w) => n + w.words.length, 0)
  const hasList = rawText.trim().length > 0 && totalWords > 0

  if (!hasList) {
    return (
      <div className="glass-card shrink-0 px-4 py-3">
        <p className="text-sm font-semibold text-[var(--color-text)]">No word list loaded</p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Tap <span className="font-semibold text-purple-300">My Lists</span> in the sidebar to add or load words
        </p>
      </div>
    )
  }

  return (
    <div className="glass-card flex shrink-0 flex-wrap items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--color-text)]">
          {totalWords} word{totalWords !== 1 ? 's' : ''} loaded
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          Week {currentWeek}
          {weeks.length > 1 ? ` of ${weeks.length}` : ''} · {currentWords.length} words this week ·{' '}
          {wordsPerWeek} per week
        </p>
      </div>
      {weeks.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {weeks.map((week) => (
            <button
              key={week.weekNumber}
              onClick={() => setCurrentWeek(week.weekNumber)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                currentWeek === week.weekNumber
                  ? 'purple-gradient text-white shadow'
                  : 'border border-purple-500/20 bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] hover:border-purple-500/40 hover:text-[var(--color-text)]'
              }`}
            >
              W{week.weekNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
