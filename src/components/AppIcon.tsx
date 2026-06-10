import type { AppMode } from '../types'

const BASE = import.meta.env.BASE_URL

export const ICONS = {
  logo: `${BASE}icons/logo.png`,
  title: `${BASE}icons/title.png`,
  chunk: `${BASE}icons/chunk.png`,
  test: `${BASE}icons/test.png`,
  unscramble: `${BASE}icons/unscramble.png`,
  game: `${BASE}icons/game.png`,
  star: `${BASE}icons/star.png`,
  moon: `${BASE}icons/moon.png`,
  sun: `${BASE}icons/sun.png`,
  flame: `${BASE}icons/flame.png`,
  lists: `${BASE}icons/lists.png`,
} as const

export const MODE_ICONS: Record<AppMode, string> = {
  chunk: ICONS.chunk,
  test: ICONS.test,
  unscramble: ICONS.unscramble,
  game: ICONS.game,
}

export type IconSize = 'xs' | 'sm' | 'stat' | 'nav' | 'md' | 'lg' | 'xl' | 'hero'

/** Fixed layout slot + visual scale — icons render larger without growing containers */
const ICON_CONFIG: Record<IconSize, { slot: string; scale: string }> = {
  xs: { slot: 'h-5 w-5', scale: 'scale-[2.4]' },
  sm: { slot: 'h-7 w-7', scale: 'scale-[2.6]' },
  stat: { slot: 'h-6 w-6', scale: 'scale-[1.65]' },
  nav: { slot: 'h-8 w-8', scale: 'scale-[2.1]' },
  md: { slot: 'h-9 w-9', scale: 'scale-[2.8]' },
  lg: { slot: 'h-12 w-12', scale: 'scale-[2.5]' },
  xl: { slot: 'h-16 w-16', scale: 'scale-[3.2]' },
  hero: { slot: 'h-24 w-24', scale: 'scale-[2.8]' },
}

interface AppIconProps {
  src: string
  alt: string
  size?: IconSize
  className?: string
  scaleOverride?: string
}

export function AppIcon({ src, alt, size = 'md', className = '', scaleOverride }: AppIconProps) {
  const { slot, scale } = ICON_CONFIG[size]
  const scaleClass = scaleOverride ?? scale

  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${slot}`}>
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`h-full w-full object-contain ${scaleClass} ${className}`}
      />
    </span>
  )
}

interface ModeIconProps {
  mode: AppMode
  size?: IconSize
  className?: string
  scaleOverride?: string
}

export function ModeIcon({ mode, size = 'md', className = '', scaleOverride }: ModeIconProps) {
  const labels: Record<AppMode, string> = {
    chunk: 'Chunk It',
    test: 'Test Mode',
    unscramble: 'Unscramble',
    game: 'Quest Mode',
  }
  return (
    <AppIcon
      src={MODE_ICONS[mode]}
      alt={labels[mode]}
      size={size}
      className={className}
      scaleOverride={scaleOverride}
    />
  )
}
