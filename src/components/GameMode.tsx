import { useState, useEffect, useCallback } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import { scrambleWord } from '../utils/parseWordList'
import { EmptyState } from './ChunkMode'
import { AppIcon, ICONS } from './AppIcon'

type ChallengeType = 'spell' | 'unscramble' | 'chunk-check'

interface Challenge {
  type: ChallengeType
  wordIndex: number
  scrambled?: string
}

const TYPE_LABELS: Record<ChallengeType, { label: string; icon: string; points: number }> = {
  spell: { label: 'Spell it!', icon: ICONS.test, points: 20 },
  unscramble: { label: 'Unscramble!', icon: ICONS.unscramble, points: 15 },
  'chunk-check': { label: 'What word is this?', icon: ICONS.chunk, points: 25 },
}

export function GameMode() {
  const { currentWords, getProgress, addGameScore, gameState } = useSpelling()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [answer, setAnswer] = useState('')
  const [selected, setSelected] = useState<number[]>([])
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [playing, setPlaying] = useState(false)
  const [round, setRound] = useState(0)

  const generateChallenge = useCallback((): Challenge | null => {
    if (currentWords.length === 0) return null
    const types: ChallengeType[] = ['spell', 'unscramble']
    const withChunks = currentWords.filter((w) => getProgress(w.word).chunks.length > 0)
    if (withChunks.length > 0) types.push('chunk-check')

    const type = types[Math.floor(Math.random() * types.length)]
    const wordIndex = Math.floor(Math.random() * currentWords.length)

    return {
      type,
      wordIndex,
      scrambled: type === 'unscramble' ? scrambleWord(currentWords[wordIndex].word) : undefined,
    }
  }, [currentWords, getProgress])

  const startGame = () => {
    setPlaying(true)
    setRound(0)
    setTimeLeft(30)
    setResult(null)
    setAnswer('')
    setSelected([])
    setChallenge(generateChallenge())
  }

  useEffect(() => {
    if (!playing || result) return
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          addGameScore(0, false)
          setResult('incorrect')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [playing, result, addGameScore])

  const checkAnswer = () => {
    if (!challenge) return
    const entry = currentWords[challenge.wordIndex]
    let correct = false

    if (challenge.type === 'spell') {
      correct = answer.toLowerCase().trim() === entry.word
    } else if (challenge.type === 'unscramble') {
      correct = selected.map((i) => challenge.scrambled![i]).join('') === entry.word
    } else {
      correct = answer.toLowerCase().trim() === entry.word
    }

    setResult(correct ? 'correct' : 'incorrect')
    const pts = TYPE_LABELS[challenge.type].points
    addGameScore(correct ? pts + timeLeft : 0, correct)
  }

  const nextRound = () => {
    setRound(round + 1)
    setTimeLeft(30)
    setResult(null)
    setAnswer('')
    setSelected([])
    setChallenge(generateChallenge())
  }

  if (currentWords.length === 0) {
    return <EmptyState message="Load a word list to start Quest Mode!" />
  }

  if (!playing) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="glass-card p-10">
          <AppIcon src={ICONS.game} alt="Quest Mode" size="hero" className="mx-auto animate-float" />
          <h2 className="mt-4 text-3xl font-bold text-[var(--color-text)]">Quest Mode</h2>
          <p className="mt-3 text-[var(--color-text-muted)]">
            Race against the clock! Random challenges — spell, unscramble, and decode chunks.
            Build streaks for bonus points.
          </p>
          <div className="mt-6 flex justify-center gap-8">
            <div className="flex flex-col items-center gap-1.5">
              <AppIcon src={ICONS.test} alt="Spell" size="sm" />
              <span className="text-sm text-purple-300">Spell</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <AppIcon src={ICONS.unscramble} alt="Unscramble" size="sm" />
              <span className="text-sm text-purple-300">Unscramble</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <AppIcon src={ICONS.chunk} alt="Decode" size="sm" />
              <span className="text-sm text-purple-300">Decode</span>
            </div>
          </div>
          <button
            onClick={startGame}
            className="mt-8 rounded-2xl purple-gradient px-10 py-4 text-lg font-bold text-white shadow-xl shadow-purple-900/40 transition hover:brightness-110"
          >
            Start Quest!
          </button>
        </div>
      </div>
    )
  }

  if (!challenge) return null

  const entry = currentWords[challenge.wordIndex]
  const info = TYPE_LABELS[challenge.type]
  const prog = getProgress(entry.word)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-muted)]">Round {round + 1}</span>
          <span className="flex items-center gap-1.5 text-sm font-bold text-purple-300">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-visible">
              <AppIcon src={ICONS.flame} alt="" size="stat" className="-translate-y-px" />
            </span>
            {gameState.streak}
          </span>
        </div>
        <div
          className={`rounded-xl px-4 py-2 text-lg font-bold ${
            timeLeft <= 10 ? 'text-[var(--color-error)]' : 'text-[var(--color-warning)]'
          }`}
        >
          ⏱ {timeLeft}s
        </div>
      </div>

      <div
        className={`glass-card p-8 text-center ${result === 'incorrect' ? 'animate-shake' : ''}`}
      >
        <span className="inline-flex items-center gap-2 overflow-visible rounded-full bg-purple-600/30 py-1.5 pl-2 pr-4 text-sm font-semibold text-purple-200">
          <AppIcon src={info.icon} alt={info.label} size="xs" />
          {info.label} · {info.points}+ pts
        </span>

        {challenge.type === 'spell' && (
          <>
            <p className="mt-6 text-xl text-[var(--color-text-muted)]">{entry.definition}</p>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !result && checkAnswer()}
              disabled={!!result}
              placeholder="Type the word..."
              className="mt-6 w-full max-w-sm rounded-xl border-2 border-purple-500/30 bg-[var(--color-bg-elevated)] px-6 py-4 text-center text-2xl font-bold text-[var(--color-text)] outline-none focus:border-purple-500"
              autoFocus
            />
          </>
        )}

        {challenge.type === 'unscramble' && challenge.scrambled && (
          <>
            <p className="mt-6 text-xl text-[var(--color-text-muted)]">{entry.definition}</p>
            <div className="mt-4 flex min-h-[3.5rem] justify-center gap-2">
              {selected.map((idx, order) => (
                <button
                  key={order}
                  onClick={() => setSelected(selected.filter((i) => i !== idx))}
                  className="cell-input correct"
                >
                  {challenge.scrambled![idx]}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {challenge.scrambled.split('').map((letter, i) => (
                <button
                  key={i}
                  onClick={() =>
                    !selected.includes(i) && !result && setSelected([...selected, i])
                  }
                  disabled={selected.includes(i) || !!result}
                  className={`cell-input ${
                    selected.includes(i) ? 'opacity-30' : 'cursor-pointer hover:border-purple-400'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </>
        )}

        {challenge.type === 'chunk-check' && (
          <>
            <p className="mt-6 text-3xl font-bold tracking-widest text-purple-300">
              {prog.chunks.join(' · ')}
            </p>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              {entry.definition}
            </p>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !result && checkAnswer()}
              disabled={!!result}
              placeholder="What word is this?"
              className="mt-6 w-full max-w-sm rounded-xl border-2 border-purple-500/30 bg-[var(--color-bg-elevated)] px-6 py-4 text-center text-2xl font-bold text-[var(--color-text)] outline-none focus:border-purple-500"
              autoFocus
            />
          </>
        )}

        {result && (
          <div className="mt-6 animate-pop">
            {result === 'correct' ? (
              <p className="text-2xl font-bold text-[var(--color-success)]">
                +{TYPE_LABELS[challenge.type].points + timeLeft} pts! 🎉
              </p>
            ) : (
              <p className="text-2xl font-bold text-[var(--color-error)]">
                It was <span className="text-[var(--color-text)]">{entry.word}</span>
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          {!result ? (
            <button
              onClick={checkAnswer}
              className="rounded-xl purple-gradient px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110"
            >
              Submit
            </button>
          ) : (
            <button
              onClick={nextRound}
              className="rounded-xl purple-gradient px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110"
            >
              Next Challenge →
            </button>
          )}
          <button
            onClick={() => setPlaying(false)}
            className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20"
          >
            End Quest
          </button>
        </div>
      </div>
    </div>
  )
}
