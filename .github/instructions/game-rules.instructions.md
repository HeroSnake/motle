---
applyTo: "src/game.js,src/config.js"
---

# Motle — Game Logic Rules

Deep reference for `src/game.js` and `src/config.js`. Everything below is verified against
the source.

---

## 1. Config is the single source of tunables

Nothing gameplay-related may be hard-coded elsewhere:

```js
clues: 1,
maxTry: 6,
minLength: 5,
maxLength: 8,
revealDelay: 250,
godMode: 'tgm',
transitions: { time: 100, duration: 200 },
sharingHeader: 'Motle ♾️',
```

Also in `config.js`: `keys` (AZERTY layout + per-letter score), `themes`, `skins`, and
`defaultLocalStorage` (`data` + `history` shapes).

---

## 2. Board model

- `maxTry = 6` rows, each `word.length` tiles.
- The **active row** is always the last element of `attempts`.
- `getNextAttempt(word)` builds a row where index `0` is `{ value: firstChar, status: 'valid' }`
  and locked in place forever. Everything else starts empty and `unchecked`.
- Tile shape: `{ value, status, newStatus, showAttemp, locked, clued }`.
- `inputIndex` is the cursor, **clamped to `0 < index < word.length`** and reset to `1` after
  every submit, reset, and clear.

---

## 3. Letter states

| Status | Meaning | Colour |
|---|---|---|
| `unchecked` | not yet evaluated | grey |
| `valid` | right letter, right position | green |
| `in-word` | right letter, wrong position | yellow |
| `invalid` | letter absent from the word | red |
| `error` | submitted word is not a real French word | strong red |
| `clued` | revealed by a clue | light blue |

The same vocabulary colours the on-screen keyboard via `keyboard[].status`.

---

## 4. `checkAttempt()` — the submit pipeline

1. **Early exit** if any tile is empty, or `status !== 'start'`.
2. **Unknown-word rejection.** The string must be in `wordsFiltered` (78,847) **or**
   `playableWordsFiltered` (20,887), both filtered to length 5–8. Otherwise: pulse `error`
   for `transitions.duration` × 5, reset every tile except index `0` to `unchecked`, and
   **return without consuming an attempt**.
3. Set `status = 'pending'` — this is the lock that prevents double submission, and it hides
   the keyboard.
4. **Score letter by letter, left to right.** Exact position → `valid`. Else if the letter is
   still in the scratch `unchecked` pool → `in-word`, and it is **spliced out** so duplicate
   letters are handled correctly. Else → `invalid`.
5. **Reveal**, one letter at a time, `await laPause(config.revealDelay)` (250 ms) between
   letters: set `newStatus`, set `showAttemp = true`, wait, then copy `newStatus` into
   `status`.
6. Merge newly-`valid` indices into `fundedLetters`, deduped via `unique`.
7. **Terminal check** → `success` if all letters `valid`, else `fail` at `maxTry`, else push
   a fresh row, refresh the keyboard, reset the cursor to 1, re-apply funded letters, return
   to `start`.

> Step 5 is what makes tiles flip. `Letter.svelte` renders `status` on the front face and
> `newStatus` on the back; if you assign `status` directly instead of copying through
> `newStatus`, the flip breaks.

---

## 5. `updateKeyboard()` — key state aggregation

Rebuilds key colours from all **completed** attempts (`history.attempts.slice(0, -1)`):

- already `valid` → never downgrade;
- only `invalid` seen → `invalid`;
- `valid` + `invalid` but no `in-word` → `valid`;
- otherwise → `in-word`.

Recalled after every submit.

---

## 6. `getScore()`

For each attempt `n` (0-based) and tile `i`:

- `status === 'valid'` **and** `i > 0` **and** that position not yet scored → `playerScore += 3^(maxTry − n)`; `bonus += keyScore(letter)`.
- else if `status === 'in-word'` → `bonus++`.

Then, if `bonus > 0`, `playerScore *= (1 + bonus / 20)`, and `Math.ceil` the result.

`i > 0` excludes the pre-filled first letter from scoring.

### Letter weights (`config.keys[].score`)

| Weight | Letters |
|---|---|
| 1 | A B C D E F G I L M N O P S |
| 2 | H J K Q R T U V |
| 3 | W X Y Z |

### Worked example — answer `BONNE`, won on attempt 3

| Attempt | Result | Base | Bonus |
|---|---|---|---|
| 1 (n=0) | idx 2 = N `valid`; idx 4 = E `in-word` | `3^6 = 729` | +1 (N) +1 (in-word) |
| 2 (n=1) | idx 1 = O `valid`; idx 4 = E `valid` | `243 + 243` | +1 +1 |
| 3 (n=2) | idx 3 = N `valid` → **success** | `3^4 = 81` | +1 |

- `playerScore = 729 + 243 + 243 + 81 = 1296`
- `bonus = 5` → `1296 × 1.25 = 1620`
- **score = 1620**; streak gain = `floor(log2(1620 / 100))` = **4**

---

## 7. Streak, high score, reroll

On **success**:

- `highScore = max(highScore, score)`
- `streak += floor(log2(score / 100))`
- if `reroll < 1` **and** `streak % 2 === 0` → `reroll++`
- `progression.updateStats({ won: true, attempts, score })`

On **fail**: `streak = 0`, `updateStats({ won: false, … })`, XP = `lossXp` (10).

> ⚠️ **Two streaks exist and they diverge.** `game.user.streak` (localStorage `data`) drives
> the flame and reroll economy and is incremented on win. `progression.stats.streak`
> (localStorage `progression`) is reset to 0 on loss but **never incremented**. They are not
> interchangeable.

**XP curve** — `xpPerLevel = baseXp × (1 + (level − 1) × 0.1)`, base 100 → L1 100, L2 110,
L3 120… `addXpInternal` loops, so one award can cross several levels. Win XP =
`winXp + (maxTry − attempts) × attemptBonus`. A 1-attempt win also bumps `stats.perfectGames`.

---

## 8. Clues and locks

- `useClue()` only while `status === 'start'` and `cluedIdx.length < clues` (or god mode).
  It records the **current cursor index**, advances right, and force-fills that tile with the
  true letter (`status: 'clued'`, `clued: true`, `value = word[i]`).
- Clues do not affect score.
- `toggleLockLetter(index)` on double-click toggles `locked`; clears on submit.
- Locked tiles must be respected in **both** `updateLetter` (no input) **and**
  `updateFoundedLetters` (no auto-fill). There is prior history for exactly this bug.

---

## 9. God mode

Typing `config.godMode` (`'tgm'`) into the username sets `game.godMode` — reveals the answer,
unlimited clues, free rerolls.

---

## 10. State machine

```js
gameStatus = ['start', 'success', 'fail', 'pending', 'reroll']

GameStateMachine = {
  start:   gameStatus,   // enterable from anywhere
  success: gameStatus,
  fail:    gameStatus,
  pending: gameStatus,
  reroll:  ['start'],     // the ONLY restricted transition
}
```

`changeGameState` refuses any transition absent from the target's list. `initGameStatus()`
runs once at store creation so a reload mid-game restores `success`/`fail` correctly.

| Status | Keyboard | Endgame overlay | Placeholder rows |
|---|---|---|---|
| `start` | shown | hidden | shown |
| `pending` | shown | hidden | shown |
| `success` | hidden | shown (green gif, share) | hidden |
| `fail` | hidden | shown (red gif, share) | hidden |
| `reroll` | hidden | shown (no gif, no share) | hidden |

---

## 11. Word selection

- Answer drawn uniformly from `playableWordsFiltered` (the 20,887 pool), not from `words`.
- Only the **index** is persisted (`history.word`); `init()` re-resolves it with
  `% playableWordsFiltered.length`, so shrinking the list can never throw.
- Both filtered arrays are `Object.freeze`d.

---

## 12. `getSharing()`

Builds `Motle ♾️` + one line of 🟩/🟨/⬛ per attempt + `Score | N`, then
`navigator.clipboard.writeText`. **No error handling** — wrap it if you touch it.

> Note the existing line is `else if (l.status = 'invalid')` — an **assignment**, not a
> comparison. It happens to produce the intended fall-through. Preserve behaviour rather than
> "fixing" it incidentally.

---

## 13. State-mutation pattern (do not refactor)

```js
let gameInstance
subscribe(game => { gameInstance = game /* … */ })

const changeFlame = flame => update(game => {
    game.user.selectedFlame = flame     // in-place mutation
    return game                         // same reference re-emitted
})
```

This is how the codebase works. A `subscribe` block also mirrors **every** emission to
localStorage (`data` + `history`), so you never need to call a save helper. Converting to
immutable updates would touch every method and risks breaking reveal timing and persistence —
only do it as a dedicated, fully manually tested PR.

---

## 14. Svelte 5 note

`src/game.js` is plain JS and framework-agnostic, but the stores it feeds use Svelte 4 syntax
under a Svelte 5 compiler. Keep that boundary intact.
