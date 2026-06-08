import { useTheme } from '../hooks/useTheme'
import { AppIcon, ICONS } from './AppIcon'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex rounded-xl bg-white/10 p-1 backdrop-blur-sm">
      <button
        onClick={() => setTheme('light')}
        aria-label="Light mode"
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
          theme === 'light'
            ? 'bg-white/25 text-white shadow-sm'
            : 'text-purple-200/70 hover:text-white'
        }`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
          <AppIcon src={ICONS.sun} alt="" size="stat" />
        </span>
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        aria-label="Dark mode"
        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition-all ${
          theme === 'dark'
            ? 'bg-white/25 text-white shadow-sm'
            : 'text-purple-200/70 hover:text-white'
        }`}
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden">
          <AppIcon src={ICONS.moon} alt="" size="stat" />
        </span>
        Dark
      </button>
    </div>
  )
}
