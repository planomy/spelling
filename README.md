# SpellQuest

A playful spelling practice app for students. Paste word lists, break words into chunks, test yourself, unscramble letters, and earn points in Quest Mode.

## Features

- **Paste any word list** — numbered or not, with definitions or example sentences
- **Auto week grouping** — 10 words per week (30 words = 3 weeks)
- **Chunk It** — break words into meaningful pieces (not always syllables)
- **Test Mode** — spell from definition with one cell per letter; optional hint mode (3 reveals)
- **Unscramble** — tap letters to rebuild the word
- **Quest Mode** — timed random challenges with score and streaks
- **Teacher Lists** — save lists for students to load later
- **Dark mode** — purple glassmorphism UI inspired by modern student dashboards

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173/spelling/

## Live site

https://planomy.github.io/spelling/

Built files live in `docs/` on `main`. After code changes, run `npm run build` and commit the updated `docs/` folder.

In repo **Settings → Pages**, set **Source** to **Deploy from a branch**, branch **main**, folder **`/docs`**.

## Word List Format

```
beautiful - very pretty
1. necessary: needed for something
ephemeral (lasting a short time)
"The word gregarious means fond of company"
```

The app extracts the word from each line and uses the rest as the definition/clue.
