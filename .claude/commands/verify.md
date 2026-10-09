---
description: Build Motle and run the full manual smoke checklist
allowed-tools: Bash(pnpm:*), Bash(npm:*), Bash(yarn:*)
---

Verify Motle after a change. There is no test suite, so this is the definition of done.

## 1. Build

```bash
npm run build
```

This is the only automated check available — it catches syntax errors and bad imports. If it
fails, stop and fix before going further.

## 2. Dev server

```bash
npm run dev     # → http://localhost:3000   (port 3000, NOT 5173)
```

## 3. Gameplay loop

1. Header, board, and keyboard all render.
2. Type a full word, press **Enter** → tiles flip green / yellow / red with a 250 ms stagger.
3. Submit a nonsense word (`XQZJV`) → row flashes red and resets. **The attempt counter must
   not advance.**
4. Win → success gif, score shown, keyboard hidden, PARTAGER available.
5. Lose 6 attempts → fail gif, answer revealed.
6. Reload mid-game → the board is restored exactly.

## 4. High-risk areas

| Area | Check |
|---|---|
| Persistence | Change username + theme, reload → both persist. Then clear localStorage in DevTools → clean fresh state, no crash. |
| Keyboard | Every AZERTY key types the right letter. `Backspace`, `Enter`, `←`, `→`, `Home`, `End` all work. |
| Theme switch | Click the logo 4× → cycles `arcade-dark → arcade-neon → arcade-retro → arcade-cyber` and back, with no unstyled flash. |
| Clue | Click the bulb → the tile under the cursor turns light blue and fills with the true letter; the count drops to 0 and the button disables. |
| Reroll | At 0 rerolls, clicking does nothing. Username `tgm` makes it free. |
| God mode | Username `tgm` → the word is revealed; the storage-clear button works. |
| Touch (phone) | Tap keys; long-press backspace clears the row; double-tap a tile locks it. |
| Wiki | Click the answer → definition modal opens. ✕, backdrop click, and **Escape** all close it. Offline → "Définition introuvable". |
| Responsive | Resize below 600 px → header controls shrink, board and keyboard still fit, no horizontal scroll. |

## 5. Regression guards

If gameplay logic changed, confirm:

- [ ] `inputIndex` never reaches `0` and always resets to `1` after a submit
- [ ] The reveal loop still awaits `config.revealDelay` and holds `status = 'pending'`
- [ ] `showAttemp` + `newStatus` → `status` copy still drives the tile flip
- [ ] Locked tiles resist both manual input and funded-letter auto-fill
- [ ] No state was converted to immutable updates
- [ ] No new magic numbers outside `config.js`

## 6. Report

State explicitly which checks passed, which were skipped, and why. Do not claim a check ran
when it did not.
