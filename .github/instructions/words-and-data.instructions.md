---
applyTo: "src/words.js,src/playableWords.js,src/action.js,src/progression.js"
---

# Motle — Word Lists, Persistence & Progression

Deep reference for the data layer.

---

## 1. ⚠️ The word-list filenames are inverted

| File | Size | Entries | Export | Actual role |
|---|---|---|---|---|
| `src/playableWords.js` | 327 KB | **20,887** | `playableWords` | **The pool the answer is drawn from.** Curated, common, playable. |
| `src/words.js` | 1.3 MB | **78,847** | `words` | **The full dictionary**, used *only* to validate that a submitted guess is a real word. |

`playableWords` is the *smaller* set; `words` is the *larger* one. Intuitively backwards —
read this table, not the filename.

Format (both files):

```js
export let playableWords = [
    "ABACA",
    "ABAISSE",
    …
]
```

Uppercase ASCII, one string per line, alphabetically sorted.

### Filtering

```js
const wordsFiltered         = Object.freeze([...words.filter(w => w.length >= 5 && w.length <= 8)])
const playableWordsFiltered = Object.freeze([...playableWords.filter(w => w.length >= 5 && w.length <= 8)])
```

Computed **once** at store construction. Bounds come from `config.minLength` (5) and
`config.maxLength` (8); changing them silently drops words from both lists.

### Usage

- **Answer selection** — `Math.floor(Math.random() * playableWordsFiltered.length)`. Only
  `playableWords`.
- **Guess validation** — `wordsFiltered.includes(s) || playableWordsFiltered.includes(s)`.
  Either list is accepted on purpose: you may submit a real French word that is not in the
  answer pool.
- **Restore** — `playableWordsFiltered[history.word % playableWordsFiltered.length]`. The
  modulo guarantees no throw if the list shrinks between sessions.

### Adding words

- To `playableWords.js` → becomes **answerable**.
- To `words.js` → becomes **accepted as a guess**.
- Most useful words belong in **both**.
- Keep uppercase and alphabetically sorted.
- ~20 bytes/word; there is no build-time validation, so one malformed line breaks the import
  for the whole app. Run `npm run build` after editing.
- **Never run a formatter over these files** — a multi-thousand-line unreviewable diff that
  destroys the ability to review actual word additions.

> `README.md` claims "2,000 French words". Wrong by an order of magnitude. Use the numbers
> above.

---

## 2. localStorage keys

| Key | Written by | Contents |
|---|---|---|
| `data` | `game.js` | Player profile |
| `history` | `game.js` | In-progress board so a refresh resumes |
| `progression` | `progression.js` | Level, XP, skins, stats, current theme |
| `theme` | `theme.js` — **dead module** | Legacy theme index; nothing reads it |

### `data`

```js
{ username: 'No1', highScore: 0, streak: 0, theme: 'dark', reroll: 1, selectedFlame: false }
```

`theme` here is a **dead field** — the UI reads `$progression.currentTheme`. `selectedFlame:
false` means "auto-pick by streak threshold".

### `history`

```js
{ attempts: [], word: -1, clues: [], fundedLetters: [] }
```

`word` is an **index** into `playableWordsFiltered`; `-1` = not yet chosen. `clues` holds
**indices** of clue-revealed tiles — note that `config.clues = 1` is a **count**. Two different
meanings of "clues" live in this codebase; do not conflate them.

### `progression`

```js
{
  level: 1, xp: 0, totalXp: 0,
  unlockedSkins: ['default'], currentSkin: 'default',
  currentTheme: 'arcade-dark',
  stats: { gamesPlayed: 0, gamesWon: 0, perfectGames: 0, streak: 0, totalScore: 0 },
}
```

---

## 3. `getLocalStorage` — the defensive read (`action.js`)

```js
getLocalStorage(key, defaultLocalStorage)
```

1. `JSON.parse(localStorage.getItem(key))` in a `try/catch` — corrupt JSON returns the default
   instead of throwing.
2. If the value is `null` **or** `typeof value !== typeof default` → return the default. The
   `typeof` guard is what prevents the historical *"type of null is object"* crash.
3. If the default is an object, **backfill** any key missing from the stored object.

Step 3 is why new fields can be added to `config.defaultLocalStorage` and picked up by existing
players with **no migration step**. Follow that pattern: add a field to the default, never
write a manual migration.

`saveToLocalStorage(key, value)` is `JSON.stringify` + `setItem`.

### Caveat: not SSR-safe

`getLocalStorage` runs at **module evaluation time** in `createGame()`. That is why
`+page.js` sets `ssr = false`. Never import `game.js` from server-executed code.

### Persistence side effects

`game.js` has a `subscribe()` block that mirrors **every** store emission to `data` and
`history`. You therefore never call a save helper manually. `progression.js` instead writes
explicitly inside each `update()` callback.

---

## 4. Progression maths

```js
xpPerLevel = baseXp × (1 + (level − 1) × 0.1)      // baseXp = 100
```

L1 → 100, L2 → 110, L3 → 120… `addXpInternal` loops with `while`, so one large award can
cross several levels at once.

- **Win XP** = `winXp + (maxTry − attempts) × attemptBonus` = `50 + (6 − n) × 5`
- **Loss XP** = `lossXp` = `10`
- A 1-attempt win additionally increments `stats.perfectGames`.

**Skins** unlock every 5th level where a `config.skins[level]` entry exists (5, 10, 15, 20, 25
→ fire, ice, neon, gold, cosmic). `unlockedSkins` is populated and persisted but **no UI reads
it** — `setSkin` and `addXp` are exported and never called.

### Two streaks — they diverge

| | Incremented? | Drives |
|---|---|---|
| `game.user.streak` (`data`) | yes, `+= floor(log2(score / 100))` on win | flame style, reroll economy |
| `progression.stats.streak` (`progression`) | **never incremented**; reset to 0 on loss | nothing currently |

Both reset to `0` on a loss. Do not assume they mean the same thing.

---

## 5. `action.js` helpers

Leaf module — imports nothing, and must stay that way.

| Helper | Purpose |
|---|---|
| `longpress(node, threshold = 750)` | Svelte **action** dispatching a `longpress` CustomEvent; used by `use:longpress` on the keyboard backspace button |
| `laPause(ms)` | `Promise` wrapping `setTimeout` — used for the per-letter reveal |
| `lePulse(ms, amount, cb)` | `Promise` calling `cb` on an interval `amount + 1` times — drives the unknown-word error animation |
| `unique(value, index, self)` | `Array.prototype` dedupe predicate — used for `fundedLetters` |
| `saveToLocalStorage` / `getLocalStorage` | see §3 |

---

## 6. External API

`Wiki.svelte` fetches definitions when the player clicks the answer on the end screen:

```
https://freedictionaryapi.com/api/v1/entries/fr/<word lowercased>
```

- Renders `word`, `entries[].partOfSpeech`, `entries[].pronunciations[0].text`,
  `entries[].senses[].definition`, `senses[].examples[]`, `senses[].synonyms[]`,
  `entries[].synonyms[]`, `entries[].antonyms[]`.
- **Module-level cache** holds only the most recent word, so flipping between two words
  refetches.
- Failure → `error = true`, renders "Définition introuvable". The modal must always remain
  closable.
- `onMount`, so browser-only. No API key, no rate-limit handling.
- Synonyms/antonyms may be strings **or** `{ word: … }` objects — hence `s.word ?? s`.

Treat as **optional, non-blocking, network-dependent** UI. The game must stay fully playable
offline; never place a gameplay dependency behind this call.
