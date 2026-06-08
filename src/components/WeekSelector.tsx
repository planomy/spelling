import { useSpelling } from '../hooks/useSpellingStore'

export function WeekSelector() {
  const { weeks, currentWeek, setCurrentWeek } = useSpelling()

  if (weeks.length <= 1) return null

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-[var(--color-text-muted)]">Week</span>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {weeks.map((week) => (
          <button
            key={week.weekNumber}
            onClick={() => setCurrentWeek(week.weekNumber)}
            className={`shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
              currentWeek === week.weekNumber
                ? 'purple-gradient text-white shadow-lg shadow-purple-900/30'
                : 'border border-purple-500/20 bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:border-purple-500/40 hover:text-[var(--color-text)]'
            }`}
          >
            Week {week.weekNumber}
            <span className="ml-1.5 text-xs opacity-70">({week.words.length})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
