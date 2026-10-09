---
applyTo: "src/**/*.svelte,static/**/*.css,static/**/*.html,src/app.html"
---

# Motle — UI, Styling & Components

Deep reference for `.svelte` components and CSS.

---

## 1. Hard rule: legacy Svelte syntax only

The compiler is **Svelte 5**, but every component uses the **Svelte 4 syntax model**:

```svelte
<script>
    export let letter = { … }            // NOT $props()
    $: cluesLeft = Math.max(…, 0)        // NOT $derived()
    on:click={game.reroll}               // NOT onclick=
</script>

<svelte:window on:keydown={keyInput} />  <!-- legacy event directive -->
```

- Do **not** introduce `$props()`, `$state()`, `$derived()`, or `onclick=`.
- Do **not** add `<script lang="ts">` or convert `.js` → `.ts`.
- Mixing models **inside one component** is a compile error.

---

## 2. Component map

| File | Responsibility |
|---|---|
| `routes/+page.svelte` | Root layout, `+page.js` (`ssr = false`) |
| `lib/Header.svelte` | Theme cycle, level + XP bar, username, high score, flame, clue, reroll |
| `lib/Plate.svelte` | Board: attempts, placeholders, `<Endgame />`, `<Godmode />` |
| `lib/Letter.svelte` | One tile — CSS 3D flip card |
| `lib/Keyboard.svelte` | On-screen AZERTY keyboard + global physical-key handler |
| `lib/Endgame.svelte` | Post-game overlay, share, hosts `<Wiki />` |
| `lib/Wiki.svelte` | Definition modal (`freedictionaryapi.com`) |
| `lib/Godmode.svelte` | God-mode reveal + save-wipe button |
| `lib/Flames/MainFlame.svelte` | Streak flame + flame-style dropdown |

**Dead — not imported anywhere:** `lib/ModalName.svelte`,
`lib/Flames/{Basic,LowPoly,Pixel}.svelte`.

### Root layout (`+page.svelte`)

```svelte
<div class="{$progression.currentTheme} {!['pending','start'].includes($game.status) ? 'end-game' : ''}"
     style="height:100svh;">
  <Header /> <Plate /> <Keyboard />
</div>
```

Two state-driven classes: `currentTheme` selects the palette, `end-game` is added whenever the
game is over (themes key off it, e.g. `.arcade-dark:not(.end-game) .locked .word-block`).

`100svh` (small viewport height) is deliberate so mobile chrome collapsing doesn't clip the
keyboard.

---

## 3. The letter tile

`Letter.svelte` renders two faces in `.flip-card-inner`:

- `.flip-card-front` — current `letter.status`
- `.flip-card-back` — `letter.newStatus`

Root classes, computed reactively:

| Class | Condition | Effect |
|---|---|---|
| `show-attemp` | `letter.showAttemp` | `transform: rotateY(180deg)`, 0.6 s |
| `input-index` | tile is the cursor target | theme applies pulsing glow |
| `locked` | `letter.locked` | red inset shadow while not end-game |

Fixed **50 × 50 px**, `perspective: 1000px`, `backface-visibility: hidden`.

---

## 4. Placeholder rows

`Plate.svelte` fills unused rows with `Letter` components carrying only a `filter` prop — an
inline `background-color: hsl(0, 0%, N%)` where `N = floor(Math.random() * 27) + 30`.

> ⚠️ `Math.random()` is called **in the template**, so these grey blocks re-randomise on every
> render of `Plate`. This is existing behaviour, not a bug to chase. Hoist to component state
> only if explicitly asked.

---

## 5. Keyboard

### On-screen

`config.keys` is 26 letters in **AZERTY row order**:

```
row 1 (idx 0-9)    A Z E R T Y U I O P
row 2 (idx 10-19)  Q S D F G H J K L M
row 3 (idx 20-25)  W X C V B N
```

- **ENTER** injected when `index == 20` (start of row 3) —
  `.enter { grid-column-start: 1; grid-column-end: 3; }`
- **BACKSPACE** appended after the loop —
  `.supp { grid-column-start: 9; grid-column-end: 11; }`
- `.keyboard-container` is a CSS grid, `grid-gap: 8px`, max-width **512 px**, fixed to the
  viewport bottom, centred with `translateX(-50%)`.

### Physical

One `<svelte:window on:keydown>` in `Keyboard.svelte`, active only when `status === 'start'`:

| Key | Action |
|---|---|
| `A`–`Z` | `game.inputVal(letter)` if present in `$game.keyboard` |
| `Backspace` | `game.suppVal()` |
| `Enter` | `game.checkAttempt()` |
| `ArrowRight` / `ArrowLeft` | `game.goRight()` / `game.goLeft()` |
| `Home` / `End` | `game.goStart()` / `game.goEnd()` |

Letter keys short-circuit before the `switch`. Mapping is by **letter identity**, not physical
position, so a QWERTY user typing `W` or `Z` still gets the right French letter.

### Touch

- Tap a key to type.
- **Long-press 750 ms on backspace** clears the whole current row
  (`use:longpress` + `on:longpress={game.clearAttempt}`, action defined in `action.js`).
- Tap a tile to move the cursor; **double-tap to lock**.

`global.css` sets `touch-action: manipulation`, `user-select: none`,
`-webkit-touch-callout: none` on `body` to kill iOS selection during play.

---

## 6. Theming

Four themes, each a standalone stylesheet in `static/style/themes/`:

| id | Name | bg | accent |
|---|---|---|---|
| `arcade-dark` | Arcade Dark | `#0a0e27` | `#ff00ff` |
| `arcade-neon` | Neon | `#0f0f0f` | `#00ff88` |
| `arcade-retro` | Retro | `#1a1410` | `#ffaa00` |
| `arcade-cyber` | Cyber | `#001a26` | `#00ffff` |

- **All four are `<link>`ed in `app.html`**, so switching is a class swap — no request, no FOUC.
- Cycling: clicking the logo in `Header.svelte` → `cycleTheme()` → `progression.setTheme()`.
  Wraps around.

### Authoring rules

1. Scope **every** rule under `.arcade-<id>` so themes never bleed into each other.
2. Use `!important` liberally — `global.css` loads first but targets overlapping selectors;
   existing theme files all rely on `!important` to win. Match that style, don't fight it.
3. Prefer `currentColor` — most chrome re-themes from the root colour automatically.
4. Reuse the existing semantic class names: `.word-block`, `.valid`, `.invalid`, `.in-word`,
   `.clued`, `.error`, `.input-index`, `.locked`, `.keyboard`, `.keyboard-letter`,
   `.keyboard-key`, `.header`, `.logo-btn`, `.end-btn`, `.replay-btn`, `.share-btn`.
5. Keyframes (`pulse-glow`, `scale-pop`, `neon-flicker`, `bounce-in`, `slide-up`, `flip-valid`,
   `fade-in`, `rotate`) are defined once in `global.css` — reference by name, never redefine.

### Legacy

`global.css` still carries full `.dark` / `.light` blocks from the pre-arcade design. No theme
id resolves to them, so they are unreachable. Also orphaned: `.themes`, `.logo-section`,
`.level-badge`, `.help`, `.username`, `.clear`, `.reset`, `.wiki-overlay`, `.input-container`.

---

## 7. Typography

Two `@font-face` rules in `global.css`:

```css
@font-face { font-family: 'UbuntuMono regular'; src: url('../fonts/UbuntuMono-Regular.ttf'); }
@font-face { font-family: 'Playfair';       src: url('../fonts/Playfair_144pt-Light.ttf'); }
```

- `body` → `'UbuntuMono regular', monospace !important`
- `Playfair` → logo `M`, god-mode bar, `.logo-btn`
- Bold/Italic/BoldItalic UbuntuMono files exist on disk but are **not** registered;
  `font-weight: 700` is synthesised.

---

## 8. Animation & timing reference

| Where | Duration | Source |
|---|---|---|
| Per-letter reveal | **250 ms** | `config.revealDelay` |
| Unknown-word error pulse | 5 × **200 ms** | `lePulse(config.transitions.duration, 4, …)` |
| Error reset | **100 ms** after last pulse | `config.transitions.time` |
| Tile flip | **0.6 s** | `.show-attemp .flip-card-inner` |
| Keyboard / overlay | Svelte `slide` | Keyboard, Endgame, Godmode |
| Wiki modal | `fade` **200 ms** | `<div transition:fade={{duration: 200}}>` |
| Flame selector item | Svelte `blur` | MainFlame |
| Cursor pulse | `pulse-glow` 1.5 s infinite | theme CSS on `.input-index` |

> The game's *rhythm* lives in `config.revealDelay` / `config.transitions`. Tune those before
> touching component CSS.

---

## 9. Responsive

- Root `100svh`, single vertical column.
- `@media (max-width: 600px)` in `Header.svelte` — logo 48→44 px, name input 80→60 px,
  action buttons 44→40 px.
- `@media (max-width: 512px)` in `Wiki.svelte` — full-width modal.
- Keyboard capped at 512 px; tiles fixed 50 px; grid gap 8 px.

---

## 10. Event forwarding pattern

`Letter.svelte` declares handlers with **no value** on the host element and the parent
forwards them:

```svelte
<!-- Letter.svelte -->  <div on:click on:dblclick on:keydown …>
<!-- +page.svelte -->    <Letter on:click={…} on:dblclick={…} />
```

Preserve this; changing one side alone silently breaks interaction.

---

## 11. Icons

```svelte
import Icon from 'svelte-awesome'
import { lightbulbO, star, user, refresh } from 'svelte-awesome/icons'

<Icon data={star} scale={1.1} />
```

In use: `lightbulbO`, `star`, `user`, `refresh` · `repeat`, `share` · `arrowLeft`,
`checkCircle` · `timesCircleO`, `checkCircleO` · `fire`.

---

## 12. Accessibility

**Done:** `role="button"` + `tabindex="0"` on the clickable answer; `aria-label` on the wiki
close button; `maxlength="12"` on the username; real `<button>` elements throughout.

**Known gaps** — fix opportunistically, don't gate unrelated work on them:

- Status is conveyed by **colour alone**; no live region announces win/loss or the new word.
- Decorative end-screen gifs are announced to screen readers.
- Icon-only buttons rely on `title` for their accessible name.

---

## 13. `src/app.html` (PWA + theme links)

The shell is the one place theme and PWA metadata live.

- **Theme stylesheets**: all four `<link>`s are present at all times so switching is a class
  swap with no flash. Do **not** conditionally inject or remove them.
- **PWA block**: manifest link, `theme-color`, `description`, 192/512 icon links,
  `apple-touch-icon`, and the Apple web-app meta tags. `theme-color` must stay in sync with
  `theme_color` in `static/manifest.webmanifest` (both `#0a0e27`).
- `<html lang="fr">` — the game and the manifest are French. A screen reader using `en`
  pronounces the French word list incorrectly.
- Indentation here is **tabs**, unlike the 4-space convention used in `src/*.js`.
- Do not add a `<script>` tag; `%sveltekit.head%` and `%sveltekit.body%` must stay intact.

---

## 14. README screenshots — update on every visual change

> ⚠️ **Non-negotiable: any change that alters what the app displays must regenerate
> `static/img/readme/`.** Stale screenshots are worse than missing ones, because they make the
> README actively lie. This includes edits to components, component `<style>`, theme CSS,
> `app.html`, the header layout, the keyboard, the endgame overlay — **and game-state changes
> that alter what renders** (letter colours, clue tiles, locked tiles, god-mode bar).

The README embeds four files:

| File | Shows |
|---|---|
| `static/img/readme/gameplay.png` | board mid-guess + full keyboard |
| `static/img/readme/reveal.png` | a submitted row with every colour |
| `static/img/readme/win.png` | victory screen |
| `static/img/readme/themes.png` | all four themes, composited |

**Regeneration procedure** (captured at 390 × 844):

1. Run `npm run dev` and open the app at a **390 × 844** viewport.
2. Hide the scrollbar (`::-webkit-scrollbar { width: 0 }`) — it otherwise shows as a grey bar.
3. **Drive the game with `page.keyboard`, not clicks.** Force-clicking `.keyboard-letter`
   silently misses: the board is inside a scrollable `.page` while the keyboard is
   `position: fixed`, so the computed click point lands elsewhere.
4. **Wait for animations to settle before capturing.** Svelte `slide`/`fade` transitions and
   the 250 ms-per-letter reveal both run long; screenshotting mid-flight catches a fading
   keyboard, unflipped tiles, or a still-visible endgame overlay.
5. Save **over the existing filename** so `README.md` links stay valid.

**Deterministic board states:** set the username to `tgm` (god mode) to read the answer from
`.godmode span`, then rename before capturing so the cheat bar is not in the shot.

**Rebuilding `themes.png`:** capture a `clip: { x: 0, y: 0, width: 390, height: 300 }` of each
of the four themes, then composite them side by side with an ~8 px gap and a ~30 px label bar
on a `#0a0e27` background. Make sure the game is in the **same board state** in all four —
a stale overlay or a partially-filled row in one panel looks like a bug.

**Do not** add a screenshot-generation script or a Playwright dependency. The repo has no
tooling beyond `dev`/`build`/`preview`, and adding a dependency for docs images is not a
trade worth making.
