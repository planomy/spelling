import { useState, useEffect, useRef } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import { scrambleWord } from '../utils/parseWordList'
import { EmptyState } from './ChunkMode'

export function UnscrambleMode() {
  const { currentWords, getWordKey, getProgress, markUnscramblePassed, addGameScore } = useSpelling()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scrambled, setScrambled] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)
  const [wrongFlash, setWrongFlash] = useState<number | null>(null)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const entry = currentWords[currentIndex]
  const wordKey = entry ? getWordKey(entry.word) : ''

  useEffect(() => {
    if (!entry) return
    setScrambled(scrambleWord(entry.word))
    setSelected([])
    setResult(null)
    setWrongFlash(null)
  }, [currentIndex, entry?.word])

  useEffect(() => {
    return () => {
      if (flashTimer.current) clearTimeout(flashTimer.current)
    }
  }, [])

  const pickLetter = (index: number) => {
    if (result || !entry || selected.includes(index)) return

    const expected = entry.word[selected.length]
    const letter = scrambled[index]

    if (letter === expected) {
      const next = [...selected, index]
      setSelected(next)
      if (next.length === entry.word.length) {
        setResult('correct')
        markUnscramblePassed(wordKey)
        addGameScore(15, true)
      }
    } else {
      setWrongFlash(index)
      if (flashTimer.current) clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setWrongFlash(null), 700)
    }
  }

  const reset = () => {
    setSelected([])
    setResult(null)
    setWrongFlash(null)
  }

  if (currentWords.length === 0) {
    return <EmptyState message="Load a word list to start unscrambling!" />
  }

  if (!entry) return null

  const passedCount = currentWords.filter((w) => getProgress(w.word).unscramblePassed).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <span className="text-sm text-[var(--color-text-muted)]">
          Word {currentIndex + 1} of {currentWords.length}
        </span>
        <div className="mt-1 h-2 w-48 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]">
          <div
            className="h-full purple-gradient transition-all duration-500"
            style={{ width: `${(passedCount / currentWords.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        className={`glass-card p-8 text-center ${wrongFlash !== null ? 'animate-shake' : ''}`}
      >
        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-purple-300">
          Unscramble this word
        </p>
        <p className="mb-8 text-xl leading-relaxed text-[var(--color-text-muted)]">
          {entry.definition || 'Use the definition as a clue!'}
        </p>

        <div className="mb-6 flex min-h-[4rem] flex-wrap justify-center gap-2">
          {entry.word.split('').map((_, order) => {
            const idx = selected[order]
            const filled = idx !== undefined
            return (
              <span
                key={order}
                className={`cell-input ${filled ? 'correct' : 'border-dashed opacity-40'}`}
              >
                {filled ? scrambled[idx] : ''}
              </span>
            )
          })}
        </div>

        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
          Tap letters in order — green is correct, red means try again
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {scrambled.split('').map((letter, i) => {
            const isUsed = selected.includes(i)
            const isWrong = wrongFlash === i

            return (
              <button
                key={i}
                onClick={() => pickLetter(i)}
                disabled={isUsed || !!result}
                className={`cell-input transition-all ${
                  isUsed
                    ? 'correct scale-90 opacity-40'
                    : isWrong
                      ? 'incorrect animate-shake'
                      : 'cursor-pointer hover:border-purple-400 hover:bg-purple-600/20'
                }`}
              >
                {letter}
              </button>
            )
          })}
        </div>

        {result === 'correct' && (
          <div className="mt-6 animate-pop">
            <p className="text-2xl font-bold text-[var(--color-success)]">Unscrambled! 🎉</p>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20 disabled:opacity-30"
          >
            ← Prev
          </button>
          {!result ? (
            <button
              onClick={reset}
              className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20"
            >
              Reset
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              disabled={currentIndex >= currentWords.length - 1}
              className="rounded-xl purple-gradient px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:opacity-30"
            >
              Next →
            </button>
          )}
          <button
            onClick={() => setCurrentIndex(Math.min(currentWords.length - 1, currentIndex + 1))}
            disabled={currentIndex >= currentWords.length - 1}
            className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20 disabled:opacity-30"
          >
            Skip →
          </button>
        </div>
      </div>
    </div>
  )
}
