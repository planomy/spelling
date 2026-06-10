import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { ActiveListBar } from './components/ActiveListBar'
import { ListManagerModal } from './components/ListManagerModal'
import { ChunkMode } from './components/ChunkMode'
import { TestMode } from './components/TestMode'
import { UnscrambleMode } from './components/UnscrambleMode'
import { GameMode } from './components/GameMode'
import { ModeIcon } from './components/AppIcon'
import { useSpelling } from './hooks/useSpellingStore'

const MODE_TITLES = {
  chunk: { title: 'Chunk It', subtitle: 'Break words into pieces that make sense to you' },
  test: { title: 'Test Mode', subtitle: 'Spell each word from its definition' },
  unscramble: { title: 'Unscramble', subtitle: 'Rearrange the letters to find the word' },
  game: { title: 'Quest Mode', subtitle: 'Timed challenges to earn points and streaks' },
}

export default function App() {
  const { mode, currentWords, weeks, currentWeek } = useSpelling()
  const info = MODE_TITLES[mode]
  const [listManagerOpen, setListManagerOpen] = useState(false)

  return (
    <>
      <div className="flex h-full flex-col gap-3 p-3 md:flex-row md:gap-5 md:p-5">
        <Sidebar onOpenListManager={() => setListManagerOpen(true)} />

        <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden md:gap-5">
        <header className="purple-gradient relative overflow-hidden rounded-2xl px-5 py-4 shadow-xl shadow-purple-900/30 md:px-8 md:py-6">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white md:text-3xl">{info.title}</h2>
            <p className="mt-1 text-purple-200/80">{info.subtitle}</p>
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-40 animate-float">
            <ModeIcon mode={mode} size="xl" />
          </div>
          {currentWords.length > 0 && (
            <div className="relative z-10 mt-3 flex items-center gap-3">
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur-sm">
                Week {currentWeek}{weeks.length > 1 ? ` of ${weeks.length}` : ''}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur-sm">
                {currentWords.length} words
              </span>
            </div>
          )}
        </header>

        <ActiveListBar />

        <div
          className={`min-h-0 flex-1 pb-4 ${mode === 'chunk' ? 'overflow-hidden' : 'overflow-y-auto'}`}
        >
          {mode === 'chunk' && <ChunkMode />}
          {mode === 'test' && <TestMode />}
          {mode === 'unscramble' && <UnscrambleMode />}
          {mode === 'game' && <GameMode />}
        </div>
      </main>
      </div>

      <ListManagerModal open={listManagerOpen} onClose={() => setListManagerOpen(false)} />
    </>
  )
}
