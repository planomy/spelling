import { useState, useEffect, useRef } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'

export function ChunkMode() {
  const {
    currentWords,
    selectedWordIndex,
    setSelectedWordIndex,
    getWordKey,
    getProgress,
    setChunks,
  } = useSpelling()

  const selected = selectedWordIndex !== null ? currentWords[selectedWordIndex] : null
  const wordKey = selected ? getWordKey(selected.word) : ''
  const savedChunks = selected ? getProgress(selected.word).chunks : []

  const [chunks, setLocalChunks] = useState<string[]>([''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (savedChunks.length > 0) {
      setLocalChunks(savedChunks)
    } else if (selected) {
      setLocalChunks([''])
    }
  }, [selected?.word, savedChunks.join('|')])

  const updateChunk = (index: number, value: string) => {
    const next = [...chunks]
    next[index] = value
    setLocalChunks(next)
    if (wordKey) setChunks(wordKey, next.filter(Boolean))
  }

  const addChunk = () => {
    setLocalChunks([...chunks, ''])
    setTimeout(() => inputRefs.current[chunks.length]?.focus(), 50)
  }

  const removeChunk = (index: number) => {
    if (chunks.length <= 1) return
    const next = chunks.filter((_, i) => i !== index)
    setLocalChunks(next)
    if (wordKey) setChunks(wordKey, next.filter(Boolean))
  }

  const combined = chunks.join('')
  const matches = selected ? combined.toLowerCase() === selected.word : false

  if (currentWords.length === 0) {
    return <EmptyState message="Load a word list to start chunking!" />
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5 lg:flex-row">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <h2 className="mb-3 shrink-0 text-xl font-bold text-[var(--color-text)]">Your Words</h2>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {currentWords.map((entry, i) => {
          const prog = getProgress(entry.word)
          const hasChunks = prog.chunks.length > 0
          const isSelected = selectedWordIndex === i

          return (
            <button
              key={entry.word + i}
              onClick={() => setSelectedWordIndex(i)}
              className={`grid h-16 w-full items-center gap-x-4 overflow-hidden rounded-xl px-5 text-left transition-all ${
                hasChunks ? 'grid-cols-[auto_5.5rem_1fr]' : 'grid-cols-[auto_1fr]'
              } ${
                isSelected
                  ? 'border-2 border-purple-400 shadow-lg shadow-purple-900/20'
                  : 'glass-card hover:border-purple-500/40'
              }`}
              style={isSelected ? { background: 'var(--selected-row-bg)' } : undefined}
            >
              <span className="shrink-0 text-2xl font-bold text-[var(--color-text)]">{entry.word}</span>
              {hasChunks && (
                <span
                  className="line-clamp-2 w-[5.5rem] shrink-0 rounded-xl px-2 py-1 text-center text-[0.65rem] leading-snug"
                  style={{ background: 'var(--chunk-pill-bg)', color: 'var(--chunk-pill-text)' }}
                >
                  {prog.chunks.join(' · ')}
                </span>
              )}
              {entry.definition && (
                <span className="min-w-0 line-clamp-2 text-sm leading-snug text-[var(--color-text-muted)]">
                  {entry.definition}
                </span>
              )}
            </button>
          )
        })}
        </div>
      </div>

      <div className="w-full shrink-0 lg:w-96 lg:self-start">
        {selected ? (
          <div className="glass-card animate-pop p-6">
            <h3 className="mb-1 text-3xl font-bold text-[var(--color-text)]">{selected.word}</h3>
            {selected.definition && (
              <p className="mb-5 text-base text-[var(--color-text-muted)]">{selected.definition}</p>
            )}

            <p className="mb-3 text-sm font-medium text-purple-300">
              Break it into chunks that make sense to you
            </p>

            <div className="flex flex-wrap gap-2">
              {chunks.map((chunk, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    ref={(el) => { inputRefs.current[i] = el }}
                    value={chunk}
                    onChange={(e) => updateChunk(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addChunk()
                      if (e.key === 'Backspace' && !chunk && chunks.length > 1) removeChunk(i)
                    }}
                    className="chunk-cell"
                    placeholder="..."
                    autoFocus={i === chunks.length - 1}
                  />
                  {chunks.length > 1 && (
                    <button
                      onClick={() => removeChunk(i)}
                      className="text-xs text-[var(--color-text-muted)] hover:text-red-400"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addChunk}
                className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-dashed border-purple-500/30 text-xl text-purple-400 transition hover:border-purple-500/60 hover:bg-purple-600/10"
              >
                +
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-[var(--color-text-muted)]">Combined:</span>
              <span
                className={`text-lg font-bold ${matches ? 'text-[var(--color-success)]' : 'text-[var(--color-text)]'}`}
              >
                {combined || '—'}
              </span>
              {combined && (
                <span className="text-lg">{matches ? '✅' : '⚠️'}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="glass-card flex h-48 items-center justify-center p-6">
            <p className="text-center text-[var(--color-text-muted)]">
              Select a word to start chunking →
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-2xl border-2 border-dashed border-purple-500/20">
      <p className="text-lg text-[var(--color-text-muted)]">{message}</p>
    </div>
  )
}

export { EmptyState }
