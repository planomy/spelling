import { useState, useRef, useEffect } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import { EmptyState } from './ChunkMode'

const MAX_HINTS = 3

export function TestMode() {
  const { currentWords, getWordKey, getProgress, markTestPassed, addGameScore } = useSpelling()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [letters, setLetters] = useState<string[]>([])
  const [hintMode, setHintMode] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const entry = currentWords[currentIndex]
  const wordKey = entry ? getWordKey(entry.word) : ''
  const alreadyPassed = entry ? getProgress(entry.word).testPassed : false

  useEffect(() => {
    if (!entry) return
    setLetters(Array(entry.word.length).fill(''))
    setHintsUsed(0)
    setRevealedIndices(new Set())
    setResult(null)
    setTimeout(() => inputRefs.current[0]?.focus(), 50)
  }, [currentIndex, entry?.word])

  const handleLetterChange = (index: number, value: string) => {
    if (revealedIndices.has(index)) return
    const char = value.slice(-1).toLowerCase()
    const next = [...letters]
    next[index] = char
    setLetters(next)
    setResult(null)
    if (char && index < letters.length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !letters[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'Enter') checkAnswer()
  }

  const handleCellClick = (index: number) => {
    if (!hintMode || hintsUsed >= MAX_HINTS || revealedIndices.has(index) || !entry) return
    const next = new Set(revealedIndices)
    next.add(index)
    setRevealedIndices(next)
    setHintsUsed(hintsUsed + 1)
    const nextLetters = [...letters]
    nextLetters[index] = entry.word[index]
    setLetters(nextLetters)
  }

  const checkAnswer = () => {
    if (!entry) return
    const correct = letters.join('') === entry.word
    setResult(correct ? 'correct' : 'incorrect')
    if (correct) {
      markTestPassed(wordKey)
      addGameScore(10 + (MAX_HINTS - hintsUsed) * 5, true)
    } else {
      addGameScore(0, false)
    }
  }

  const goToWord = (index: number) => {
    setCurrentIndex(index)
  }

  if (currentWords.length === 0) {
    return <EmptyState message="Load a word list to start testing!" />
  }

  if (!entry) return null

  const passedCount = currentWords.filter((w) => getProgress(w.word).testPassed).length

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
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
        <label className="flex cursor-pointer items-center gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">Hint mode</span>
          <button
            type="button"
            role="switch"
            aria-checked={hintMode}
            onClick={() => setHintMode(!hintMode)}
            className={`inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-colors ${
              hintMode ? 'bg-purple-600' : 'bg-[var(--color-bg-elevated)]'
            }`}
          >
            <span
              className={`block h-6 w-6 shrink-0 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                hintMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </div>

      <div
        className={`glass-card p-8 text-center ${result === 'incorrect' ? 'animate-shake' : ''}`}
      >
        {alreadyPassed && !result && (
          <span className="mb-3 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
            ✓ Previously passed
          </span>
        )}

        <p className="mb-2 text-sm font-medium uppercase tracking-wider text-purple-300">
          Spell this word
        </p>
        <p className="mb-8 text-xl leading-relaxed text-[var(--color-text-muted)]">
          {entry.definition || 'No definition provided — good luck!'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          {entry.word.split('').map((_, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              value={letters[i] || ''}
              onChange={(e) => handleLetterChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onClick={() => hintMode && !letters[i] && handleCellClick(i)}
              readOnly={revealedIndices.has(i)}
              title={hintMode && !revealedIndices.has(i) ? 'Click empty cell to reveal letter' : undefined}
              className={`cell-input ${
                hintMode && !revealedIndices.has(i) && !letters[i]
                  ? 'cursor-pointer hover:border-[var(--color-warning)]'
                  : ''
              } ${
                result === 'correct'
                  ? 'correct'
                  : result === 'incorrect'
                    ? 'incorrect'
                    : ''
              } ${revealedIndices.has(i) ? 'revealed' : ''}`}
              maxLength={1}
            />
          ))}
        </div>

        {hintMode && (
          <p className="mt-3 text-sm text-[var(--color-warning)]">
            Click up to {MAX_HINTS} cells to reveal letters ({MAX_HINTS - hintsUsed} left)
          </p>
        )}

        {result && (
          <div className="mt-6 animate-pop">
            {result === 'correct' ? (
              <p className="text-2xl font-bold text-[var(--color-success)]">Correct! 🎉</p>
            ) : (
              <p className="text-2xl font-bold text-[var(--color-error)]">
                Not quite — it&apos;s <span className="text-[var(--color-text)]">{entry.word}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => goToWord(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20 disabled:opacity-30"
          >
            ← Prev
          </button>
          {!result ? (
            <button
              onClick={checkAnswer}
              className="rounded-xl purple-gradient px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110"
            >
              Check
            </button>
          ) : (
            <button
              onClick={() => goToWord(currentIndex + 1)}
              disabled={currentIndex >= currentWords.length - 1}
              className="rounded-xl purple-gradient px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:opacity-30"
            >
              Next →
            </button>
          )}
          <button
            onClick={() => goToWord(currentIndex + 1)}
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
