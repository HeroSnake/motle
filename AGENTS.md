# AGENTS.md — Motle

Universal entry point for AI coding agents (and humans) in this repository.

**Motle** is a French Wordle-style guessing game. A hidden French word of 5–8 letters is
revealed one letter at a time; the player has **6 attempts** to type a real French word.
SvelteKit + Vite, client-rendered SPA, **no backend, no tests, no linter, no CI**.

---

## Where the detailed guidance lives

Each agent tool has its own well-known folder. The deep reference is **shared**, so nobody
works from a different version of the truth:

| Agent | Auto-loads | Folder |
|---|---|---|
| **GitHub Copilot** | `.github/copilot-instructions.md` | [`.github/`](.github/) |
| **Claude Code** | `.claude/CLAUDE.md` | [`.claude/`](.claude/) |
| **opencode, Codex, Cursor, AGENTS.md-standard tools** | this file | — |

```
.github/
├── copilot-instructions.md            always-loaded core knowledge
├── instructions/                      path-scoped, loaded when you edit matching files
│   ├── game-rules.instructions.md     src/game.js, src/config.js
│   ├── ui.instructions.md             src/**/*.svelte, static/**/*.css
│   ├── words-and-data.instructions.md word lists, action.js, progression.js
│   └── tooling.instructions.md        package.json, vite.config.js, compose.yml, configs
└── prompts/
    └── verify-build.prompt.md         /verify equivalent

.claude/
├── CLAUDE.md                          project memory; @-imports the same instruction files
├── agents/                            specialised subagents
│   ├── motle-ui.md                    components, theming, animations, responsive
│   ├── motle-rules.md                 gameplay logic, scoring, state machine
│   └── motle-words.md                 word lists, persistence, XP
├── commands/
│   ├── verify.md                      /verify — build + full smoke checklist
│   └── add-word.md                    /add-word — add to both word lists correctly
└── settings.json                      permissions allowlist
```

**Single source of truth:** the deep reference lives in
`.github/instructions/*.instructions.md`. `.claude/CLAUDE.md` imports those same files with
`@` imports rather than duplicating them. When a detail changes, edit it there and every
agent picks it up.

If your tool auto-loads nothing, read this file plus the relevant file(s) in
`.github/instructions/` — together that is the complete knowledge base.

---

## Quick start

```bash
npm install
npm run dev        # → http://localhost:3000   (port 3000, NOT 5173)
npm run build      # the closest thing to a test suite — always run it
```

No `lint`, `test`, or `format` script exists. Do not add one as a drive-by change.

---

## Stack

SvelteKit 2 · Svelte 5 (running in **legacy/compat** mode) · Vite 5 · **plain JavaScript, no
TypeScript** · `@sveltestrap/sveltestrap` (grid + input) · `svelte-awesome` (icons).

`src/routes/+page.js` sets `ssr = false` — the app is a client-only SPA.

> ⚠️ **Svelte 5 compiler, Svelte 4 syntax.** Every component uses `export let`, `$:` reactive
> statements, and `on:click` directives. Do **not** convert a component to runes (`$props()`,
> `$state()`, `onclick=`) — mixing the two models in one file is a compile error. Never add
> `<script lang="ts">` or convert `.js` → `.ts`.

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
  ~18 methods (`inputVal`, `suppVal`, `clearAttempt`, `customInput`,
  `goLeft/goRight/goStart/goEnd`, `toggleLockLetter`, `checkAttempt`, `useClue`, `reroll`,
  `resetGame`, `getScore`, `getSharing`, `inputName`, `clearStorage`, `changeFlame`).
- **`progression`** (`src/progression.js`) — `level`, `xp`, `totalXp`, `unlockedSkins`,
  `currentSkin`, `currentTheme`, `stats`.

```
routes + lib components ──► game.js ──► config.js / action.js / words / playableWords
                            └────────► progression.js
```

`config.js` and `action.js` are leaves — they import nothing. Keep them that way.
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
- **God mode**: username `tgm` → reveals the answer, unlimited clues, free rerolls.
- Statuses `start | pending | success | fail | reroll`; only `reroll` is restricted (only
  enterable from `start`).

---

## Conventions

- **4-space indent.** Root config files (`vite.config.js`, `svelte.config.js`) use 2.
- Tunables go in `config.js` — never hard-code a gameplay constant in a component or in
  `game.js`.
- State is mutated **in place** and re-emitted (`update(game => gameInstance)`). Established
  pattern — do **not** opportunistically refactor to immutable updates.
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
4. **`README.md` is stale** — pre-SvelteKit layout, port 5173, "2,000 words". Trust this file
   and `.github/instructions/` instead.
5. **Reveal timing is load-bearing.** `checkAttempt` awaits a pause per letter and holds
   `status = 'pending'` to block double submission. Do not make it synchronous.
6. **`Plate.svelte` calls `Math.random()` in the template**, so placeholder tiles re-randomise
   their shade each render. Pre-existing behaviour — leave it.
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
- [ ] Manual smoke test run (`.github/prompts/verify-build.prompt.md` or `/verify`).
- [ ] **If the change altered what the app displays, the README screenshots in
      `static/img/readme/` were regenerated** (see `.github/instructions/ui.instructions.md` § 14).

If you changed gameplay rules, update `.github/instructions/game-rules.instructions.md` in the
same change — every agent reads it from there.
