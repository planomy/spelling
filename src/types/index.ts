export interface WordEntry {
  word: string
  definition: string
}

export interface WeekList {
  weekNumber: number
  words: WordEntry[]
}

export type ListSize = 5 | 10 | 20

export interface TeacherList {
  id: string
  name: string
  rawText: string
  wordsPerWeek: ListSize
  createdAt: string
}

export interface WordProgress {
  chunks: string[]
  testPassed: boolean
  unscramblePassed: boolean
}

export type AppMode = 'chunk' | 'test' | 'unscramble' | 'game'

export interface GameState {
  score: number
  streak: number
  bestStreak: number
  wordsCompleted: number
}

export const DEFAULT_WORDS_PER_WEEK: ListSize = 10
