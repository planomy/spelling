import { useEffect, useRef, useState } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import type { ListSize } from '../types'
import { createListTemplate, parseWordList } from '../utils/parseWordList'
import { AppIcon, ICONS } from './AppIcon'

const LIST_SIZES: ListSize[] = [5, 10, 20]

interface ListManagerModalProps {
  open: boolean
  onClose: () => void
}

export function ListManagerModal({ open, onClose }: ListManagerModalProps) {
  const {
    rawText,
    wordsPerWeek,
    loadText,
    teacherLists,
    saveTeacherList,
    loadTeacherList,
    deleteTeacherList,
  } = useSpelling()

  const [text, setText] = useState(rawText)
  const [listSize, setListSize] = useState<ListSize>(wordsPerWeek)
  const [listName, setListName] = useState('')
  const [savedNotice, setSavedNotice] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      setText(rawText)
      setListSize(wordsPerWeek)
      setListName('')
      setSavedNotice('')
    }
  }, [open, rawText, wordsPerWeek])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  const parsedCount = parseWordList(text).length
  const weekCount = parsedCount > 0 ? Math.ceil(parsedCount / listSize) : 0

  const startNewList = (size: ListSize) => {
    setListSize(size)
    setText(createListTemplate(size))
  }

  const applyList = () => {
    if (!text.trim()) return
    loadText(text, listSize)
    onClose()
  }

  const handleSave = () => {
    const name = listName.trim()
    if (!name || !text.trim()) return
    saveTeacherList(name, text, listSize)
    setListName('')
    setSavedNotice(`Saved "${name}"`)
    setTimeout(() => setSavedNotice(''), 2500)
  }

  const handleLoadSaved = (id: string) => {
    const list = teacherLists.find((l) => l.id === id)
    if (!list) return
    setText(list.rawText)
    setListSize(list.wordsPerWeek)
    loadTeacherList(id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm md:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-manager-title"
        className="glass-card my-4 w-full max-w-2xl animate-pop p-5 shadow-2xl md:p-7"
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="list-manager-title" className="text-xl font-bold text-[var(--color-text)] md:text-2xl">
              My Lists
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Create, save, and load spelling lists for your class
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-500/30 text-[var(--color-text-muted)] transition hover:border-purple-500/60 hover:bg-purple-600/20 hover:text-[var(--color-text)]"
          >
            ✕
          </button>
        </div>

        <section className="mb-5">
          <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Start a new list</p>
          <div className="flex flex-wrap gap-2">
            {LIST_SIZES.map((size) => (
              <button
                key={size}
                onClick={() => startNewList(size)}
                className="rounded-xl border border-purple-500/30 bg-[var(--color-bg-elevated)] px-4 py-2.5 text-sm font-semibold text-purple-200 transition hover:border-purple-500/60 hover:bg-purple-600/20"
              >
                {size} words
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            Adds a numbered template — replace each line with a word and definition
          </p>
        </section>

        <section className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-[var(--color-text)]">Edit list</p>
            {parsedCount > 0 && (
              <span className="rounded-full bg-purple-600/30 px-3 py-1 text-xs font-semibold text-purple-200">
                {parsedCount} word{parsedCount !== 1 ? 's' : ''}
                {weekCount > 1 ? ` · ${weekCount} weeks` : weekCount === 1 ? ' · 1 week' : ''}
              </span>
            )}
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`One word per line:\n\n1. beautiful - very pretty\n2. necessary: needed for something\n3. ephemeral (lasting a short time)`}
            className="h-44 w-full resize-y rounded-xl border border-purple-500/20 bg-[var(--color-bg-elevated)] p-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500/50 md:h-52"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">Words per week</span>
            <div className="flex gap-1 rounded-xl bg-[var(--color-bg-elevated)] p-1">
              {LIST_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setListSize(size)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    listSize === size
                      ? 'purple-gradient text-white shadow'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={applyList}
            disabled={!text.trim() || parsedCount === 0}
            className="rounded-xl purple-gradient px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:opacity-40"
          >
            Use this list
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-purple-500/30 px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:bg-purple-600/20"
          >
            Cancel
          </button>
        </div>

        <section className="border-t border-purple-500/20 pt-5">
          <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">Saved lists</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="List name (e.g. Week 3 — Science)"
              className="min-w-0 flex-1 rounded-xl border border-purple-500/20 bg-[var(--color-bg-elevated)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-purple-500/50"
            />
            <button
              onClick={handleSave}
              disabled={!listName.trim() || !text.trim() || parsedCount === 0}
              className="rounded-xl bg-purple-600/40 px-5 py-2.5 text-sm font-semibold text-purple-100 transition hover:bg-purple-600/60 disabled:opacity-40"
            >
              Save list
            </button>
          </div>
          {savedNotice && (
            <p className="mt-2 text-sm font-medium text-[var(--color-success)]">{savedNotice}</p>
          )}

          {teacherLists.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-purple-500/20 px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
              No saved lists yet — create one above and tap Save list
            </p>
          ) : (
            <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto pr-1">
              {teacherLists.map((list) => {
                const count = parseWordList(list.rawText).length
                return (
                  <li
                    key={list.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-bg-elevated)] px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[var(--color-text)]">{list.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {count} word{count !== 1 ? 's' : ''} · {list.wordsPerWeek} per week
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleLoadSaved(list.id)}
                        className="rounded-lg purple-gradient px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:brightness-110"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => deleteTeacherList(list.id)}
                        aria-label={`Delete ${list.name}`}
                        className="rounded-lg px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export function MyListsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center rounded-xl py-3 pl-3 pr-4 text-left text-sm font-medium text-purple-100/80 transition-all hover:bg-white/10 hover:text-white"
    >
      <span className="flex h-10 w-11 shrink-0 items-center justify-center overflow-visible">
        <AppIcon src={ICONS.lists} alt="" size="nav" scaleOverride="scale-[1.65]" />
      </span>
      <span className="min-w-0 flex-1 pl-3">My Lists</span>
    </button>
  )
}
