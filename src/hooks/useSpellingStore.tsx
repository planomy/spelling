import { createContext, useContext, useCallback, useMemo, useState, useEffect, type ReactNode } from 'react'
import type { AppMode, GameState, ListSize, TeacherList, WeekList, WordProgress } from '../types'
import { DEFAULT_WORDS_PER_WEEK } from '../types'
import { generateId, groupIntoWeeks, parseWordList } from '../utils/parseWordList'

const STORAGE_KEY = 'spellquest-data'

interface StoredData {
  rawText: string
  currentWeek: number
  wordsPerWeek: ListSize
  progress: Record<string, WordProgress>
  teacherLists: TeacherList[]
  gameState: GameState
}

interface SpellingContextValue {
  rawText: string
  weeks: WeekList[]
  currentWeek: number
  setCurrentWeek: (week: number) => void
  mode: AppMode
  setMode: (mode: AppMode) => void
  selectedWordIndex: number | null
  setSelectedWordIndex: (index: number | null) => void
  currentWords: WordEntry[]
  progress: Record<string, WordProgress>
  setChunks: (wordKey: string, chunks: string[]) => void
  markTestPassed: (wordKey: string) => void
  markUnscramblePassed: (wordKey: string) => void
  wordsPerWeek: ListSize
  setWordsPerWeek: (size: ListSize) => void
  loadText: (text: string, wordsPerWeek?: ListSize) => void
  teacherLists: TeacherList[]
  saveTeacherList: (name: string, rawText?: string, wordsPerWeek?: ListSize) => void
  loadTeacherList: (id: string) => void
  deleteTeacherList: (id: string) => void
  gameState: GameState
  addGameScore: (points: number, correct: boolean) => void
  getWordKey: (word: string) => string
  getProgress: (word: string) => WordProgress
}

import type { WordEntry } from '../types'

const defaultProgress = (): WordProgress => ({
  chunks: [],
  testPassed: false,
  unscramblePassed: false,
})

const defaultGameState: GameState = {
  score: 0,
  streak: 0,
  bestStreak: 0,
  wordsCompleted: 0,
}

function loadStored(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return normalizeStored(JSON.parse(raw) as StoredData)
  } catch {
    /* ignore */
  }
  return {
    rawText: '',
    currentWeek: 1,
    wordsPerWeek: DEFAULT_WORDS_PER_WEEK,
    progress: {},
    teacherLists: [],
    gameState: defaultGameState,
  }
}

function normalizeStored(data: StoredData): StoredData {
  return {
    ...data,
    wordsPerWeek: data.wordsPerWeek ?? DEFAULT_WORDS_PER_WEEK,
    teacherLists: (data.teacherLists ?? []).map((list) => ({
      ...list,
      wordsPerWeek: list.wordsPerWeek ?? DEFAULT_WORDS_PER_WEEK,
    })),
  }
}

const SpellingContext = createContext<SpellingContextValue | null>(null)

export function SpellingProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useState<StoredData>(() => normalizeStored(loadStored()))
  const [mode, setMode] = useState<AppMode>('chunk')
  const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null)

  const weeks = useMemo(
    () => groupIntoWeeks(parseWordList(stored.rawText), stored.wordsPerWeek),
    [stored.rawText, stored.wordsPerWeek],
  )

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  }, [stored])

  const getWordKey = useCallback(
    (word: string) => `w${stored.currentWeek}-${word}`,
    [stored.currentWeek],
  )

  const getProgress = useCallback(
    (word: string): WordProgress => stored.progress[getWordKey(word)] ?? defaultProgress(),
    [stored.progress, getWordKey],
  )

  const currentWords = useMemo(() => {
    const week = weeks.find((w) => w.weekNumber === stored.currentWeek)
    return week?.words ?? []
  }, [weeks, stored.currentWeek])

  const updateStored = useCallback((patch: Partial<StoredData>) => {
    setStored((prev) => ({ ...prev, ...patch }))
  }, [])

  const loadText = useCallback((text: string, wordsPerWeek?: ListSize) => {
    setStored((prev) => ({
      ...prev,
      rawText: text,
      currentWeek: 1,
      ...(wordsPerWeek !== undefined ? { wordsPerWeek } : {}),
    }))
    setSelectedWordIndex(null)
  }, [])

  const setWordsPerWeek = useCallback((size: ListSize) => {
    updateStored({ wordsPerWeek: size })
    setSelectedWordIndex(null)
  }, [updateStored])

  const setCurrentWeek = useCallback((week: number) => {
    updateStored({ currentWeek: week })
    setSelectedWordIndex(null)
  }, [updateStored])

  const setChunks = useCallback(
    (wordKey: string, chunks: string[]) => {
      setStored((prev) => ({
        ...prev,
        progress: {
          ...prev.progress,
          [wordKey]: {
            ...(prev.progress[wordKey] ?? defaultProgress()),
            chunks,
          },
        },
      }))
    },
    [],
  )

  const markTestPassed = useCallback((wordKey: string) => {
    setStored((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [wordKey]: {
          ...(prev.progress[wordKey] ?? defaultProgress()),
          testPassed: true,
        },
      },
    }))
  }, [])

  const markUnscramblePassed = useCallback((wordKey: string) => {
    setStored((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        [wordKey]: {
          ...(prev.progress[wordKey] ?? defaultProgress()),
          unscramblePassed: true,
        },
      },
    }))
  }, [])

  const saveTeacherList = useCallback(
    (name: string, rawText?: string, wordsPerWeek?: ListSize) => {
      const text = (rawText ?? stored.rawText).trim()
      if (!text) return
      const list: TeacherList = {
        id: generateId(),
        name,
        rawText: text,
        wordsPerWeek: wordsPerWeek ?? stored.wordsPerWeek,
        createdAt: new Date().toISOString(),
      }
      setStored((prev) => ({
        ...prev,
        teacherLists: [...prev.teacherLists, list],
      }))
    },
    [stored.rawText, stored.wordsPerWeek],
  )

  const loadTeacherList = useCallback((id: string) => {
    setStored((prev) => {
      const list = prev.teacherLists.find((l) => l.id === id)
      if (!list) return prev
      return {
        ...prev,
        rawText: list.rawText,
        wordsPerWeek: list.wordsPerWeek ?? DEFAULT_WORDS_PER_WEEK,
        currentWeek: 1,
      }
    })
    setSelectedWordIndex(null)
  }, [])

  const deleteTeacherList = useCallback((id: string) => {
    setStored((prev) => ({
      ...prev,
      teacherLists: prev.teacherLists.filter((l) => l.id !== id),
    }))
  }, [])

  const addGameScore = useCallback((points: number, correct: boolean) => {
    setStored((prev) => {
      const streak = correct ? prev.gameState.streak + 1 : 0
      return {
        ...prev,
        gameState: {
          score: prev.gameState.score + (correct ? points : 0),
          streak,
          bestStreak: Math.max(prev.gameState.bestStreak, streak),
          wordsCompleted: prev.gameState.wordsCompleted + (correct ? 1 : 0),
        },
      }
    })
  }, [])

  const value: SpellingContextValue = {
    rawText: stored.rawText,
    weeks,
    currentWeek: stored.currentWeek,
    setCurrentWeek,
    mode,
    setMode,
    selectedWordIndex,
    setSelectedWordIndex,
    currentWords,
    progress: stored.progress,
    setChunks,
    markTestPassed,
    markUnscramblePassed,
    wordsPerWeek: stored.wordsPerWeek,
    setWordsPerWeek,
    loadText,
    teacherLists: stored.teacherLists,
    saveTeacherList,
    loadTeacherList,
    deleteTeacherList,
    gameState: stored.gameState,
    addGameScore,
    getWordKey,
    getProgress,
  }

  return <SpellingContext.Provider value={value}>{children}</SpellingContext.Provider>
}

export function useSpelling() {
  const ctx = useContext(SpellingContext)
  if (!ctx) throw new Error('useSpelling must be used within SpellingProvider')
  return ctx
}
