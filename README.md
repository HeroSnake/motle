<h1 align="center">Motle</h1>

<p align="center">
  <em>A French Wordle. Six tries, one word, no hints you didn't pay for.</em>
</p>

<p align="center">
  <img src="static/logo.png" width="88" alt="Motle logo" />
</p>

<p align="center">
  <a href="#how-to-play">How to play</a> ·
  <a href="#the-colours">The colours</a> ·
  <a href="#the-interface">The interface</a> ·
  <a href="#scoring">Scoring</a> ·
  <a href="#extras">Extras</a> ·
  <a href="#themes">Themes</a> ·
  <a href="#install-it">Install it</a> ·
  <a href="#developing">Developing</a>
</p>

---

<p align="center">
  <img src="static/img/readme/gameplay.png" width="300" alt="The Motle board on a phone: a six-letter word in progress, with the AZERTY keyboard below." />
</p>

**Motle** is *Le Mot* reimagined as an arcade cabinet. A hidden French word is waiting; you
get **six attempts** to find it, and every guess has to be a real French word — not a string
of hopeful letters.

It runs entirely in the browser. No account, no server, no tracking. Install it and it plays
offline.

---

## How to play

- The word is **5 to 8 letters**, French, and shown in **uppercase**.
- **The first letter is already filled in** and cannot be changed. It's your first free
  present, and it costs you nothing.
- Type the remaining letters into the tiles, then confirm.
- Each submitted guess has to be **a real French word**. Anything else flashes red, tells you
  so, and **does not use up an attempt**.
- Find the word in **6 attempts** and you win. Run out and you lose — but the answer is shown
  either way, and you can look it up.

### The colours

<img src="static/img/readme/reveal.png" width="300" alt="A submitted row showing green, yellow and red tiles, with the keyboard below coloured to match." />

| Tile | Means |
|---|---|
| 🟩 **Green** | Right letter, right place. Locked in — you won't need to guess it again. |
| 🟨 **Yellow** | Right letter, wrong place. It's in the word, somewhere else. |
| 🟥 **Red** | This letter isn't in the word at all. |
| 🟦 **Blue** | Revealed by a clue. Free information, but you only get one. |

The keyboard colours itself from every guess you've made, so it accumulates knowledge as the
round goes on. In the screenshot above, `AVISER` was submitted against `ABASIE`: the **A** and
**S** landed correctly, **I** and **E** are in the word but misplaced, and **V** and **R** are
now known to be absent.

> Repeated letters are handled properly. If the answer has two `E`s but you only guessed one,
> only one is credited as yellow — the second is treated as a miss.

---

## The interface

<img src="static/img/readme/gameplay.png" width="300" alt="The Motle board with header, tiles and keyboard." />

### Header

| | |
|---|---|
| **`M`** | Tap it to cycle through the four themes. |
| **LV / bar** | Your level, and progress to the next one. Levels come from XP earned across games. |
| **Name** | Tap to rename. Max 12 characters. |
| **★ Score** | Your best score so far. |
| **🔥 Streak** | Consecutive wins, and the flame you earn by stringing them together. Tap it to pick a flame style once you've unlocked one. |
| **💡 Clue** | Spends your one clue, revealing the letter under the cursor. |
| **↻ Reroll** | Throws the word away for a new one. You get one; you earn another every second win in a streak. |

### Board

- **Six rows.** The top row is live; the rest fill in as you play.
- The tile under the **cursor glows**. Tap any tile to move it there.
- **Double-tap a tile to lock it** — locked tiles keep their letter and won't be overwritten
  by a clue or by the letters you've already found.
- Letters you've confirmed stay filled in on every following row, so you're never re-guessing
  a letter you already have.

### Keyboard

- A standard **AZERTY** layout, matching French keyboards.
- **✓** confirms, **←** deletes.
- **Long-press ←** to wipe the whole current row at once — a real time-saver on a phone.
- A physical keyboard works too, including arrows, <kbd>Home</kbd> and <kbd>End</kbd>.

### Winning

<img src="static/img/readme/win.png" width="300" alt="The win screen: a celebratory robot, the answer, the score, and Replay and Share buttons." />

On victory you get a short animation, your score, and the word. **Tap the word to look it
up** — Motle pulls its definition from a free dictionary API, so you can check what you just
guessed.

<kbd>REJOUER</kbd> starts a fresh game. <kbd>PARTAGER</kbd> copies a result grid to your
clipboard, ready to paste.

---

## Scoring

Score rewards **finishing early** and **using expensive letters**.

Every letter you place correctly is worth `3^(6 − attempt)` — so a hit on your first try is
worth 729, on your second 243, and so on. Those points are then multiplied by a bonus that
grows with the letter's rarity in French, and with every yellow you collect along the way.

| Bonus weight | Letters |
|---|---|
| ×1 | A B C D E F G I L M N O P S |
| ×2 | H J K Q R T U V |
| ×3 | W X Y Z |

> Found `ABASIE` on the second try → **2297 points**, and your streak grew by 4.

Winning also earns XP — the faster you finish, the more you get, and the **LV** bar in the
header tracks your progress. Keep a streak alive to upgrade your flame.

---

## Extras

- **Clue** — one per game, free in god mode.
- **Reroll** — one per game; you earn another every second win in a streak.
- **Themes** — four full palettes, all preloaded so switching never flashes.
- **Offline** — the whole app is cached after your first visit.
- **God mode** — name yourself `tgm` and the game reveals the answer, gives you unlimited
  clues, and makes rerolls free. For debugging, obviously.

---

## Themes

<img src="static/img/readme/themes.png" alt="The same board shown in all four themes: Arcade Dark, Neon, Retro and Cyber." />

Tap the logo to cycle: **Arcade Dark**, **Neon**, **Retro**, **Cyber**. Your choice is
remembered.

---

## Install it

Motle is a PWA — it installs to your home screen and launches fullscreen, with no browser
chrome.

- **Android / Chrome** — menu → *Install app*
- **iOS / Safari** — Share → *Add to Home Screen*
- **Desktop Chrome / Edge** — install icon in the address bar

After the first visit it works with no connection at all.

---

## Developing

Requires **Node.js 20**.

```bash
npm install
npm run dev       # → http://localhost:3000
npm run build     # production build
npm run preview   # serve the build
```

There is no test suite, no linter, and no CI. `npm run build` is the closest thing to a
check — run it before you open a PR.

SvelteKit 2 · Svelte 5 (legacy syntax) · Vite 5 · plain JavaScript. No backend.

---

## Screenshots

> **The screenshots in this file must be regenerated whenever a change alters what the app
> looks like.** If you touch a component, a stylesheet, a theme, or any game state that changes
> what is rendered, update them in the same change. Stale screenshots are worse than none.

They live in [`static/img/readme/`](static/img/readme/) and were captured at **390 × 844**
(iPhone 14 size), which is why they are narrow:

| File | Shows |
|---|---|
| `gameplay.png` | The board mid-guess, with the full keyboard |
| `reveal.png` | A submitted row showing every colour |
| `win.png` | The victory screen |
| `themes.png` | All four themes, composited |

**To regenerate:**

1. `npm run dev`, then open the app in a browser at a 390 × 844 viewport.
2. Hide the scrollbar, and drive it with the keyboard rather than clicking — the on-screen
   keys are hard to hit programmatically.
3. Wait for animations to **settle** before capturing. Screenshotting mid-transition catches
   the keyboard still fading out or tiles not yet flipped.
4. Save over the existing file so the filename stays stable.

To type a guaranteed-correct answer first, name yourself `tgm` and read the answer from the
god-mode bar — then rename yourself before capturing.

---

## Contributing

Keep changes focused. A few things that will bite you:

- **The word lists are named backwards.** `src/playableWords.js` is the small list the answer
  is drawn from; `src/words.js` is the huge one used only to check that guesses are real words.
- **`src/game.js` must stay the only place game rules live.** Components render state and call
  store methods — nothing else.
- **Never reformat the word lists.** They're huge, and a formatter pass buries your actual
  change in thousands of lines.
- **The letter-reveal timing is load-bearing.** It animates one tile at a time and locks
  input while doing so. Don't make it instant.

`AGENTS.md` has the full picture, including per-domain references for agents.

---

<div align="center">
  <sub>Made with SvelteKit · <a href="https://svelte.dev">Svelte</a> · <a href="https://vite.dev">Vite</a></sub>
</div>