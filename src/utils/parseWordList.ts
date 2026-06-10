import type { ListSize, WordEntry, WeekList } from '../types'
import { DEFAULT_WORDS_PER_WEEK } from '../types'

function stripNumbering(line: string): string {
  return line.replace(/^\s*(?:\d+[\.\)\:\-]\s*|\(\d+\)\s*|[\-•*]\s*)/, '').trim()
}

function extractWord(raw: string): string {
  return raw.trim().replace(/[^a-zA-Z\-']/g, '').toLowerCase()
}

function parseLine(line: string): WordEntry | null {
  const cleaned = stripNumbering(line)
  if (!cleaned) return null

  // Colon: word: definition
  const colonMatch = cleaned.match(/^(.+?)\s*:\s*(.+)$/)
  if (colonMatch) {
    const word = extractWord(colonMatch[1])
    const definition = colonMatch[2].trim()
    if (word && definition) return { word, definition }
  }

  // Parens: word (definition)
  const parenMatch = cleaned.match(/^(.+?)\s*\(\s*(.+?)\s*\)\s*$/)
  if (parenMatch) {
    const word = extractWord(parenMatch[1])
    const definition = parenMatch[2].trim()
    if (word && definition) return { word, definition }
  }

  // Spaced dash only — keeps hyphenated words like non-renewable intact
  const dashMatch = cleaned.match(/^(.+?)\s+[-–—]\s+(.+)$/)
  if (dashMatch) {
    const word = extractWord(dashMatch[1])
    const definition = dashMatch[2].trim()
    if (word && definition) return { word, definition }
  }

  const words = cleaned.split(/\s+/)
  if (words.length >= 2) {
    const firstWord = extractWord(words[0])
    if (firstWord) {
      return {
        word: firstWord,
        definition: words.slice(1).join(' '),
      }
    }
  }

  const singleWord = extractWord(cleaned)
  if (singleWord) {
    return { word: singleWord, definition: '' }
  }

  return null
}

export function parseWordList(text: string): WordEntry[] {
  const lines = text.split(/\n/)
  const entries: WordEntry[] = []

  for (const line of lines) {
    const entry = parseLine(line)
    if (entry) entries.push(entry)
  }

  return entries
}

export function groupIntoWeeks(
  words: WordEntry[],
  wordsPerWeek: ListSize = DEFAULT_WORDS_PER_WEEK,
): WeekList[] {
  const weeks: WeekList[] = []
  for (let i = 0; i < words.length; i += wordsPerWeek) {
    weeks.push({
      weekNumber: Math.floor(i / wordsPerWeek) + 1,
      words: words.slice(i, i + wordsPerWeek),
    })
  }
  return weeks
}

export function createListTemplate(count: ListSize): string {
  return Array.from({ length: count }, (_, i) => `${i + 1}. word - definition`).join('\n')
}

export function scrambleWord(word: string): string {
  const letters = word.split('')
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }
  const scrambled = letters.join('')
  return scrambled === word && word.length > 1 ? scrambleWord(word) : scrambled
}

export function generateId(): string {
  return crypto.randomUUID()
}
