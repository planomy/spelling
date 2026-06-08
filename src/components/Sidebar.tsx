import { useSpelling } from '../hooks/useSpellingStore'
import type { AppMode } from '../types'
import { AppIcon, ICONS, ModeIcon } from './AppIcon'
import { ThemeToggle } from './ThemeToggle'

const MODES: { id: AppMode; label: string }[] = [
  { id: 'chunk', label: 'Chunk It' },
  { id: 'test', label: 'Test Mode' },
  { id: 'unscramble', label: 'Unscramble' },
  { id: 'game', label: 'Quest Mode' },
]

const NAV_ICON_SCALE: Partial<Record<AppMode, string>> = {
  game: 'scale-[1.75]',
  unscramble: 'scale-[1.95]',
}

const NAV_ICON_BOX: Record<AppMode, string> = {
  chunk: 'h-10 w-11',
  test: 'h-10 w-11',
  unscramble: 'h-11 w-14',
  game: 'h-10 w-11',
}

export function Sidebar() {
  const { mode, setMode, gameState } = useSpelling()

  return (
    <aside className="flex w-full shrink-0 flex-col rounded-2xl purple-gradient p-4 shadow-2xl shadow-purple-900/40 md:w-56 md:p-5">
      <div className="relative mb-8 overflow-visible px-1 pt-5">
        <div className="relative w-full">
          <img
            src={ICONS.title}
            alt="Spell Me"
            draggable={false}
            className="relative z-0 h-14 w-full object-contain object-left"
          />
          <span className="pointer-events-none absolute left-[4px] top-[42%] z-10 -translate-y-[calc(88%+8px)]">
            <AppIcon src={ICONS.logo} alt="" size="lg" className="-rotate-12" />
          </span>
        </div>
        <p className="mt-2 text-xs text-purple-200/70">Level up your spelling!</p>
      </div>

      <nav className="flex flex-1 flex-col gap-3 md:gap-4">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`flex items-center overflow-hidden rounded-xl py-3 pl-3 pr-4 text-left text-sm font-medium transition-all ${
              mode === m.id
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                : 'text-purple-100/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span
              className={`flex shrink-0 items-center justify-center overflow-hidden ${NAV_ICON_BOX[m.id]}`}
            >
              <ModeIcon mode={m.id} size="nav" scaleOverride={NAV_ICON_SCALE[m.id]} />
            </span>
            <span className="min-w-0 flex-1 pl-3">{m.label}</span>
          </button>
        ))}
      </nav>

      <div className="mb-4">
        <ThemeToggle />
      </div>

      <div className="mt-auto rounded-xl bg-white/10 p-4 backdrop-blur-sm">
        <p className="text-xs text-purple-200/70">Quest Score</p>
        <p className="text-2xl font-bold text-white">{gameState.score}</p>
        <div className="mt-2 flex gap-4">
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-visible">
              <AppIcon src={ICONS.flame} alt="" size="stat" className="-translate-y-px" />
            </span>
            <span className="text-sm font-semibold text-white">{gameState.streak}</span>
            <span className="text-xs text-purple-200/70">streak</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-visible">
              <AppIcon src={ICONS.star} alt="" size="stat" className="-translate-y-px" />
            </span>
            <span className="text-sm font-semibold text-white">{gameState.bestStreak}</span>
            <span className="text-xs text-purple-200/70">best</span>
          </span>
        </div>
      </div>

      <p className="mt-2 text-center text-[0.65rem] leading-none text-purple-200/50">
        Created by Mr C 2026
      </p>
    </aside>
  )
}
