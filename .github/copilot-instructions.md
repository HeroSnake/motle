# Motle — Repository Instructions

**Motle** is a French Wordle-style guessing game. A hidden French word of 5–8 letters is
revealed one letter at a time; the player gets **6 attempts** to type a real French word.
SvelteKit + Vite, client-rendered SPA, **no backend, no tests, no linter, no CI**.

This file is loaded for every Copilot request in this repository. It is self-contained on
purpose — do not rely on following links to discover the basics.

---

## Commands

```bash
npm install
npm run dev        # → http://localhost:3000   (port 3000, NOT 5173)
npm run build      # the closest thing to a test suite — always run it
npm run preview
```

There is **no** `lint`, `test`, or `format` script. Do not add one as a drive-by change.

---

## Stack

SvelteKit 2 · Svelte 5 (running in **legacy/compat** mode) · Vite 5 · **plain JavaScript,
no TypeScript** · `@sveltestrap/sveltestrap` (grid + input) · `svelte-awesome` (icons).

`src/routes/+page.js` sets `ssr = false` — the app is a client-only SPA.

> ⚠️ **Svelte 5 compiler, Svelte 4 syntax.** Every component uses `export let`, `$:` reactive
> statements, and `on:click` directives. Do **not** convert a component to runes
> (`$props()`, `$state()`, `onclick=`) — mixing the two models in one file is a hard error.
> Also do not add `<script lang="ts">` or convert `.js` → `.ts`.

---

## Layout

```
src/
├── config.js          ALL tunables (maxTry, word lengths, timings, themes, letters+scores)
├── game.js            core game store — the heart of the app
├── progression.js     XP / level / skins / stats store
├── action.js          helpers: longpress, laPause, lePulse, unique, localStorage read/write
├── theme.js           ⚠️ DEAD — never imported
├── words.js           78,847 words — validation dictionary (large)
├── playableWords.js   20,887 words — the answer pool (small)
├── app.html           shell; <link>s all 4 theme stylesheets + PWA tags up front
├── service-worker.js  SvelteKit offline shell (precache + fetch strategies)
├── routes/+page.js    ssr = false
├── routes/+page.svelte  <Plate> — the board
└── lib/               Header, Plate, Letter, Keyboard, Endgame, Wiki, Godmode, Flames/MainFlame

static/
├── style/global.css   layout, legacy .dark/.light, @keyframes, @font-face
├── style/themes/      arcade-dark | arcade-neon | arcade-retro | arcade-cyber
├── manifest.webmanifest  PWA manifest (standalone, fr, theme #0a0e27)
├── icons/             PWA icons: any 192/512, maskable 192/512, apple-touch 180
├── img/readme/        README screenshots — regenerate on any visible UI change
├── fonts/  img/  audio/   (audio/hitMarker.mp3 is dead)
```

---

## Architecture

Two Svelte stores own all state:

- **`game`** (`src/game.js`) — live board: `status`, `word`, `attempts`, `inputIndex`,
  `fundedLetters`, `keyboard`, `clues`, `cluedIdx`, `user`, `history`, `godMode`. Exposes
  ~18 methods (`inputVal`, `suppVal`, `clearAttempt`, `customInput`, `goLeft/goRight/goStart/goEnd`,
  `toggleLockLetter`, `checkAttempt`, `useClue`, `reroll`, `resetGame`, `getScore`,
  `getSharing`, `inputName`, `clearStorage`, `changeFlame`).
- **`progression`** (`src/progression.js`) — `level`, `xp`, `totalXp`, `unlockedSkins`,
  `currentSkin`, `currentTheme`, `stats`.

Dependency direction, which must not be violated:

```
routes + lib components ──► game.js ──► config.js / action.js / words / playableWords
                            └────────► progression.js
config.js and action.js are leaves — they import nothing. Keep them that way.
```

Components never contain game logic; they read `$game`/`$progression` and call store methods.

---

## Game rules at a glance

- **6 attempts**, words **5–8 letters**, French, uppercase.
- **The first letter is pre-filled and fixed** — the player types positions `1 … n−1` only,
  and `inputIndex` is never `0`.
- **Guesses must be real French words**, validated against `words` (78,847) *or*
  `playableWords` (20,887). A rejected guess flashes red and does **not** consume an attempt.
- Letter states: `valid` (green), `in-word` (yellow — note the hyphen), `invalid` (red),
  plus `error` and `clued`.
- **Score** = `3^(6 − attemptIndex)` per newly-correct letter, times `(1 + bonus / 20)` where
  `bonus` sums per-letter weights (1/2/3) plus 1 per `in-word`, then `Math.ceil`.
- **1 clue** reveals the letter under the cursor; **1 reroll**, re-earned every 2 streak.
- **God mode**: type the username `tgm` → reveals the answer, unlimited clues, free rerolls.
- Statuses `start | pending | success | fail | reroll`, governed by a small state machine
  where only `reroll` is restricted (only enterable from `start`).

---

## Conventions

- **4-space indent.** Root config files (`vite.config.js`, `svelte.config.js`) use 2.
- Tunables go in `config.js`. Never hard-code a gameplay constant in a component or in
  `game.js`.
- State is mutated **in place** and re-emitted (`update(game => gameInstance)`). This is the
  established pattern — do **not** opportunistically refactor it to immutable updates.
- CSS: scope every theme rule under `.arcade-<id>`, and use `!important` + `currentColor`
  as the existing theme files do.
- Commits: `fix:`, `feat:`, `refactor:`, `clean:`, `chore:`, `UX:` with optional scope, e.g.
  `refactor(keyboard): …`. Branches are `type/kebab-case`.

---

## Landmines

1. **The word-list filenames are inverted.** `playableWords.js` is the *small* curated answer
   pool; `words.js` is the *huge* dictionary used only to validate guesses.
2. **No tests exist** and there is no runner. Verify manually.
3. **Dead code — do not assume a file is in use:** `src/theme.js`,
   `src/lib/ModalName.svelte`, `src/lib/Flames/{Basic,LowPoly,Pixel}.svelte`,
   `static/audio/hitMarker.mp3`, and `progression.addXp` / `progression.setSkin`.
4. **`README.md` is stale** — it documents a pre-SvelteKit layout, port 5173, and
   "2,000 words". Trust this file instead.
5. **Reveal timing is load-bearing.** `checkAttempt` awaits a pause per letter and holds
   `status = 'pending'` to block double submission. Do not make it synchronous.
6. **`Plate.svelte` calls `Math.random()` in the template**, so placeholder tiles
   re-randomise their shade each render. Pre-existing behaviour — leave it.
7. **Never reformat** `src/words.js`, `src/playableWords.js`, `package-lock.json`, or
   `Flames/Pixel.svelte`. A formatter pass there is a multi-thousand-line unreviewable diff.
8. **`game.js` touches `localStorage` at module scope**, which is why `ssr = false` exists.
   Never import it from server-executed code.
9. This checkout is on a **WSL mount**. Git may report "dubious ownership"; add a
   `safe.directory` entry globally rather than disabling the ownership check.

---

## Before you call a change done

- [ ] No new magic numbers — tunables went into `config.js`.
- [ ] No immutability refactor slipped in.
- [ ] Reveal timing and the `pending` lock are intact.
- [ ] Typing, backspace, enter, arrows, Home/End all still work.
- [ ] Theme still switches with no unstyled flash.
- [ ] `npm run build` passes.
- [ ] Manual smoke test run (see `.github/prompts/verify-build.prompt.md`).
- [ ] **If the change altered what the app displays, `static/img/readme/` screenshots were
      regenerated** (see `.github/instructions/ui.instructions.md` § 14).

---

## Deeper reference

These are path-scoped and loaded when you touch matching files — you do not need to read them
all up front:

| File | Applies to |
|---|---|
| `.github/instructions/game-rules.instructions.md` | `src/game.js`, `src/config.js` |
| `.github/instructions/ui.instructions.md` | `src/**/*.svelte`, `static/**/*.css` |
| `.github/instructions/words-and-data.instructions.md` | word lists, `action.js`, `progression.js` |
| `.github/instructions/tooling.instructions.md` | `package.json`, `vite.config.js`, `compose.yml`, configs |
