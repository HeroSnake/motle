# Motle — Claude Code project memory

**Motle** is a French Wordle-style guessing game. A hidden French word of 5–8 letters is
revealed one letter at a time; the player gets **6 attempts** to type a real French word.
SvelteKit + Vite, client-rendered SPA, **no backend, no tests, no linter, no CI**.

> The deep reference below lives in `.github/instructions/` so that **Copilot and Claude Code
> read exactly the same source of truth**. Edit it there — do not fork a copy into this file.

---

## Commands

```bash
npm install
npm run dev        # → http://localhost:3000   (port 3000, NOT 5173)
npm run build      # the closest thing to a test suite — always run it
npm run preview
```

No `lint`, `test`, or `format` script exists. Do not add one as a drive-by change.

---

## Stack

SvelteKit 2 · Svelte 5 (running in **legacy/compat** mode) · Vite 5 · **plain JavaScript, no
TypeScript** · `@sveltestrap/sveltestrap` · `svelte-awesome`.
`src/routes/+page.js` sets `ssr = false` — client-only SPA.

> ⚠️ **Svelte 5 compiler, Svelte 4 syntax.** Components use `export let`, `$:` reactive
> statements, and `on:click`. Do **not** convert to runes (`$props()`, `$state()`, `onclick=`)
> — mixing models in one file is a compile error. Never add `<script lang="ts">`.

---

## Architecture

Two Svelte stores own all state:

- **`game`** (`src/game.js`) — live board: `status`, `word`, `attempts`, `inputIndex`,
  `fundedLetters`, `keyboard`, `clues`, `cluedIdx`, `user`, `history`, `godMode`. Exposes
  `inputVal`, `suppVal`, `clearAttempt`, `customInput`, `goLeft/goRight/goStart/goEnd`,
  `toggleLockLetter`, `checkAttempt`, `useClue`, `reroll`, `resetGame`, `getScore`,
  `getSharing`, `inputName`, `clearStorage`, `changeFlame`.
- **`progression`** (`src/progression.js`) — `level`, `xp`, `totalXp`, `unlockedSkins`,
  `currentSkin`, `currentTheme`, `stats`.

```
routes + lib components ──► game.js ──► config.js / action.js / words / playableWords
                            └────────► progression.js
```

`config.js` and `action.js` are leaves — they import nothing. Keep them that way.
Components never contain game logic.

---

## Game rules at a glance

- 6 attempts, words 5–8 letters, French, uppercase.
- **First letter is pre-filled and fixed** — the player types positions `1 … n−1`; `inputIndex`
  is never `0`.
- Guesses must be real French words, validated against `words` (78,847) **or** `playableWords`
  (20,887). A rejected guess flashes red and does **not** consume an attempt.
- States: `valid`, `in-word`, `invalid`, plus `error` and `clued`.
- Score = `3^(6 − attemptIndex)` per newly-correct letter, times `(1 + bonus / 20)` where bonus
  sums letter weights (1/2/3) plus 1 per `in-word`, then `Math.ceil`.
- 1 clue (reveals the letter under the cursor), 1 reroll (re-earned every 2 streak).
- **God mode**: username `tgm` → reveals the answer, unlimited clues, free rerolls.
- Statuses `start | pending | success | fail | reroll`; only `reroll` is restricted.

---

## Conventions

- **4-space indent** (root config files use 2).
- Tunables go in `config.js` — never hard-code a gameplay constant elsewhere.
- State is mutated **in place** and re-emitted (`update(game => gameInstance)`). Established
  pattern — do **not** opportunistically refactor to immutable updates.
- CSS: scope theme rules under `.arcade-<id>`, use `!important` + `currentColor`.
- Commits: `fix:`, `feat:`, `refactor:`, `clean:`, `chore:`, `UX:` with optional scope.
  Branches: `type/kebab-case`.

---

## Landmines

1. **Word-list filenames are inverted** — `playableWords.js` is the small answer pool;
   `words.js` is the huge validation dictionary.
2. **No tests, no runner.** Verify manually.
3. **Dead code:** `src/theme.js`, `lib/ModalName.svelte`, `lib/Flames/{Basic,LowPoly,Pixel}.svelte`,
   `static/audio/hitMarker.mp3`, `progression.addXp`, `progression.setSkin`.
4. **`README.md` is stale** — pre-SvelteKit layout, port 5173, "2,000 words". Ignore it.
5. **Reveal timing is load-bearing** — `checkAttempt` awaits a per-letter pause and holds
   `status = 'pending'` to block double submission. Never make it synchronous.
6. **`Plate.svelte` calls `Math.random()` in the template** — placeholder tiles re-randomise
   each render. Pre-existing; leave it.
7. **Never reformat** `src/words.js`, `src/playableWords.js`, `package-lock.json`,
   `Flames/Pixel.svelte`.
8. **`game.js` touches `localStorage` at module scope** — that is why `ssr = false` exists.
9. **WSL mount** — Git may report "dubious ownership"; add a global `safe.directory` entry
   rather than disabling the check.

---

## Deep reference (shared with Copilot)

Load these when working in their scope:

- `@../.github/instructions/game-rules.instructions.md` — `src/game.js`, `src/config.js`
  (board, submit pipeline, scoring maths, clues, locks, state machine)
- `@../.github/instructions/ui.instructions.md` — `.svelte` components, CSS, theming, timings
- `@../.github/instructions/words-and-data.instructions.md` — word lists, localStorage, XP
- `@../.github/instructions/tooling.instructions.md` — build, ports, Docker, verification

## Subagents

Use the specialist agents when the work is squarely in one domain:

- `motle-ui` — components, theming, animations, responsive
- `motle-rules` — gameplay logic, scoring, state machine
- `motle-words` — word lists, persistence, XP

## Non-negotiable: README screenshots

**Any change that alters what the app displays must regenerate `static/img/readme/`.**
Components, component `<style>`, theme CSS, `app.html`, and game-state changes that alter
rendering (letter colours, clue tiles, locked tiles, god-mode bar) all qualify. Procedure and
traps: `.github/instructions/ui.instructions.md` § 14.

## Slash commands

- `/verify` — build + full manual smoke checklist
- `/add-word` — add a word to both lists correctly, without reformatting