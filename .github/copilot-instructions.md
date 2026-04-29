# FossilHunters — Copilot Instructions

A React PWA quiz game about prehistoric history, built for Blaize (age 8). Fun-first, educational second, humour always.

## Stack

- React 19 + TypeScript 6 + Vite 8 + vite-plugin-pwa
- No React Router — navigation is a `screen` state string in `App.tsx` (phase machine)
- No backend — all state in `localStorage` via `src/engine/storage.ts`
- Web Audio API for sounds — no audio files
- `@napi-rs/canvas` + `tsx` for icon generation scripts in `scripts/`

## Build & Verify

```bash
npx tsc --noEmit   # must be zero errors before shipping
npm run build      # tsc && vite build
npm run dev        # local dev server
```

## Architecture

- `src/App.tsx` — screen phase machine, single `screen` state drives all navigation
- `src/data/` — domain records (`specimens.ts`, `eras.ts`, `comparisonData.ts`)
- `src/engine/` — scoring, storage, sounds, tts, questionGenerator
- `src/components/` — `Chrono.tsx` (mascot, 6 expressions), `QuizCard.tsx`
- `src/screens/` — one file per screen, each receives `onBack` prop
- `scripts/` — `fetch-images.mts` (Wikimedia Commons), `generate-icons.mts`
- `public/specimens/` — downloaded images + `credits.json`

## Key Conventions

- **Imports**: always top-level `import`. Never `require()` inside a function body.
- **Strings with apostrophes**: use double-quoted strings (`"It's alive!"`).
- **Unused vars/params**: `noUnusedLocals` and `noUnusedParameters` are on. Prefix with `_` or remove.
- **Template literals**: commas go outside expressions — `` `${x},000` `` not `` `${x,000}` ``.
- **Sounds**: always fire-and-forget — `playCorrect().catch(() => {})`.
- **localStorage**: always wrap reads in `try/catch`. Merge with defaults for schema migrations.
- **Screen props**: every screen gets `onBack: () => void`. Never call parent state directly.
- **Difficulty**: `'explorer' | 'scientist' | 'professor'` — drives pool size, choice count, timer.

## Data Shape

Each specimen in `src/data/specimens.ts` has:
- `id` (kebab-case), `name`, `era`, `emoji`, `wikimediaTitle?`
- `funFact` (used in TTS), `additionalFacts` (6-10, powers deep-dive quiz)
- `funny` — self-aware one-liner, double-quoted if it has an apostrophe

## Deploy

GitHub Actions workflow at `.github/workflows/deploy-fossilhunters.yml` deploys to:
`https://swon404.github.io/FossilHunters/`

Triggers on every push to `main`.
