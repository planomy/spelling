import { useState, useEffect, type ReactNode } from 'react'
import { useSpelling } from '../hooks/useSpellingStore'
import { parseWordList } from '../utils/parseWordList'

export function WordInput({ collapseButton }: { collapseButton?: ReactNode }) {
  const { rawText, loadText, teacherLists, saveTeacherList, loadTeacherList, deleteTeacherList } =
    useSpelling()
  const [text, setText] = useState(rawText)

  useEffect(() => {
    setText(rawText)
  }, [rawText])
  const [listName, setListName] = useState('')
  const [showTeacher, setShowTeacher] = useState(false)

  const handleLoad = () => {
    loadText(text)
  }

  const wordCount = parseWordList(text).length

  return (
    <div className="glass-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="shrink-0 text-lg font-semibold text-[var(--color-text)]">Word List</h2>
        <div className="flex min-w-0 items-center gap-2">
          {wordCount > 0 && (
            <span className="truncate rounded-full bg-purple-600/30 px-3 py-1 text-sm text-purple-200">
              {wordCount} word{wordCount !== 1 ? 's' : ''}
              {wordCount > 10 && ` · ${Math.ceil(wordCount / 10)} weeks`}
            </span>
          )}
          {collapseButton}
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste your words here — one per line:\n\nbeautiful - very pretty\n1. necessary: needed for something\n"The word ephemeral means lasting a short time"`}
        className="h-32 w-full resize-none rounded-xl border border-purple-500/20 bg-[var(--color-bg-elevated)] p-4 text-base text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] outline-none focus:border-purple-500/50"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={handleLoad}
          disabled={!text.trim()}
          className="rounded-xl purple-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition hover:brightness-110 disabled:opacity-40"
        >
          Load Words
        </button>
        <button
          onClick={() => setShowTeacher(!showTeacher)}
          className="rounded-xl border border-purple-500/30 bg-[var(--color-bg-elevated)] px-5 py-2.5 text-sm font-semibold text-purple-200 transition hover:border-purple-500/50"
        >
          {showTeacher ? 'Hide' : 'Teacher Lists'}
        </button>
      </div>

      {showTeacher && (
        <div className="mt-4 border-t border-purple-500/20 pt-4">
          <p className="mb-2 text-sm text-[var(--color-text-muted)]">
            Save lists for students to load later
          </p>
          <div className="flex gap-2">
            <input
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="List name (e.g. Term 2 Week 1-3)"
              className="flex-1 rounded-xl border border-purple-500/20 bg-[var(--color-bg-elevated)] px-4 py-2 text-sm text-[var(--color-text)] outline-none focus:border-purple-500/50"
            />
            <button
              onClick={() => {
                if (listName.trim() && text.trim()) {
                  saveTeacherList(listName.trim())
                  setListName('')
                }
              }}
              disabled={!listName.trim() || !text.trim()}
              className="rounded-xl bg-purple-600/40 px-4 py-2 text-sm font-semibold text-purple-100 transition hover:bg-purple-600/60 disabled:opacity-40"
            >
              Save
            </button>
          </div>

          {teacherLists.length > 0 && (
            <ul className="mt-3 space-y-2">
              {teacherLists.map((list) => (
                <li
                  key={list.id}
                  className="flex items-center justify-between rounded-xl bg-[var(--color-bg-elevated)] px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{list.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {parseWordList(list.rawText).length} words
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setText(list.rawText)
                        loadTeacherList(list.id)
                      }}
                      className="rounded-lg bg-purple-600/30 px-3 py-1 text-xs font-semibold text-purple-200 hover:bg-purple-600/50"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteTeacherList(list.id)}
                      className="rounded-lg px-3 py-1 text-xs text-[var(--color-text-muted)] hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
