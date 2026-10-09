---
applyTo: "package.json,package-lock.json,vite.config.js,svelte.config.js,compose.yml,jsconfig.json,*.json,*.yml"
---

# Motle — Tooling & Build Configuration

---

## 1. Prerequisites

- **Node.js 20** — `compose.yml` uses `node:20`. `README.md`'s "v14 or later" is stale; use 20.
- npm (bundled). Yarn is mentioned in the README but nothing is Yarn-specific.
- `node_modules/` is not committed — run `npm install` first. Lockfile is **lockfileVersion 3**.

---

## 2. Scripts

| Command | Runs | Notes |
|---|---|---|
| `npm run dev` | `vite dev --host --port 3000` | `--host` binds all interfaces (phone testing on the LAN) |
| `npm run build` | `vite build` | Uses `adapter-auto` |
| `npm run preview` | `vite preview` | Serves the build output |

**There is no `lint`, `test`, or `format` script.** Do not add one as a drive-by change.

The package is named `"www"` and is `"private": true`.

---

## 3. Dev server

```bash
npm install
npm run dev
# → http://localhost:3000
```

- **Port 3000**, not 5173. `README.md` still says 5173 and is wrong.
- `vite.config.js` sets `server.hmr.host = "0.0.0.0"`, so HMR works from a phone on the LAN.
- Open `http://<your-ip>:3000` from a phone to test touch input and the 600 px breakpoint.

### WSL

This checkout lives in WSL (`//wsl.localhost/Ubuntu/home/florent/projects/motle`). Git may
refuse with "dubious ownership":

```bash
git config --global --add safe.directory '//wsl.localhost/Ubuntu/home/florent/projects/motle'
```

Add it **globally**; never disable the ownership check or commit a repo-local override.

If you hit `ECONNREFUSED`, `EACCES .svelte-kit`, or flaky HMR over the UNC path, run the dev
server **inside WSL** against the Linux path — filesystem watching across the 9p bridge is
unreliable.

Note that a Windows-side Git and a WSL-side Git keep **separate global configs**; a
`safe.directory` added from one is not visible to the other.

---

## 4. Docker / Compose

```yaml
services:
  npm:
    image: node:20
    ports: [ "3000:3000" ]
    volumes: [ ".:/var/www" ]
    working_dir: /var/www
    entrypoint: npm run dev
    env_file: [ ".env.local" ]
```

```bash
docker compose up     # dev server on http://localhost:3000
```

> ⚠️ `env_file: .env.local` points at a file that **does not exist** and is **not** in
> `.gitignore`, so `docker compose up` fails until you `touch .env.local`. If you rely on
> this, add `.env.local` to `.gitignore` and commit an `.env.example`.

This runs the **dev server**, not a production build. No Dockerfile, no production image.

---

## 5. Production build

```bash
npm run build
npm run preview
```

`svelte.config.js` uses `adapter-auto`, which infers the target platform. There is no hosting
config committed, so you may need an explicit adapter (`adapter-static`, `adapter-vercel`, …).
If you change it, update this file in the same change.

Output lands in `.svelte-kit/output` plus the adapter's own directory; both are gitignored.

---

## 6. PWA

Motle installs and runs offline. Three pieces:

| File | Role |
|---|---|
| `static/manifest.webmanifest` | name/short_name "Motle", `lang: fr`, `display: standalone`, `orientation: portrait`, `theme_color` and `background_color` `#0a0e27` (matches `arcade-dark`), `id`/`start_url`/`scope` = `/` |
| `src/service-worker.js` | SvelteKit native offline shell — **no third-party PWA plugin** |
| `src/app.html` | manifest link, `theme-color`, `description`, icon links, Apple meta tags |

### Service-worker strategy

- Precaches `[...build, ...files, '/']`. `build` is the content-hashed JS/CSS, `files` every
  static asset, `'/'` the SPA shell.
- **Precache uses per-item `cache.add(...).catch(...)`, not `cache.addAll`.** One 404 must
  never abort install — a failed `addAll` leaves the app with no service worker at all.
- Cache name is version-keyed (`motle-${version}`); `activate` deletes every other cache, then
  `clients.claim()`.
- Fetch routing: content-hashed build assets are **cache-first**; navigations and other
  same-origin requests are **network-first** with cache fallback, falling back to the cached
  shell so a refresh works offline.
- **Cross-origin requests are not intercepted** — `freedictionaryapi.com` goes straight to
  the network, keeping the definition lookup out of the offline path.
- Only `GET` is handled; every `respondWith` returns a real `Response`, never a rejected
  promise, so a cache miss while offline degrades instead of erroring.

### Icons

`static/icons/`, generated from `static/favicon.png` (the neon "M"; note `logo.png` is a
separate light UI-only variant and is *not* the PWA source):

| File | Size | Purpose |
|---|---|---|
| `icon-192.png` | 192×192 | any |
| `icon-512.png` | 512×512 | any |
| `icon-maskable-192.png` | 192×192 | maskable (art at 62 %) |
| `icon-maskable-512.png` | 512×512 | maskable (art at 62 %) |
| `apple-touch-icon-180.png` | 180×180 | iOS home screen |

All are **opaque 24-bit RGB with no alpha channel** — iOS renders transparency as black and
Android maskable icons require full bleed. Maskable art sits at 62 % so it clears the 80 %
safe zone once Android applies a circular or squircle mask.

> If you regenerate icons, keep them opaque and keep the maskable padding. Do not
> re-encode to 8-bit indexed: GDI-style palette conversion shifts the neon gradient (measured
> max channel drift 31, with 41 % of pixels moving by more than 8), which is visible.

### Things that will break PWA silently

- Changing `theme_color` in the manifest but not the `<meta name="theme-color">` in
  `app.html` (or vice versa) desynchronises the Android status bar.
- Dropping the 512 icon breaks Chrome installability.
- Editing `src/service-worker.js` into a non-`src/` location stops SvelteKit registering it.
- `ssr = false` must stay: the shell precache assumes a single static entry document.

---

## 7. What does not exist

| Missing | Consequence |
|---|---|
| Linter (ESLint / Biome / Prettier) | No automated style gate — match surrounding style by hand |
| Formatter config, `.editorconfig` | Use 4 spaces, consistent with existing files |
| Test runner / test files | **No automated tests.** Verification is manual |
| CI (`.github/workflows`) | Nothing runs on push or PR |
| TypeScript | No type checking despite `jsconfig.json` |
| `LICENSE` | `README.md` references one; the file does not exist |
| Dependabot / Renovate | Dependency bumps are manual |

> Note: `.github/` **does** exist, but only for agent instructions
> (`copilot-instructions.md`, `instructions/`, `prompts/`). There is no CI workflow.

---

## 8. Verification

There is no automated suite, so this is the definition of "done".

**Cheapest check** (catches syntax errors and bad imports — the closest thing to a test suite):

```bash
npm run build
```

**Manual smoke test:**

1. `npm run dev` → http://localhost:3000 loads; header, board, keyboard visible.
2. Type 5 letters, **Enter** → tiles flip green/yellow/red with a 250 ms stagger.
3. Submit nonsense (`XQZJV`) → row flashes red and resets; **attempt counter does not advance**.
4. Complete the word → win gif, score shown, keyboard hidden, PARTAGER available.
5. Lose 6 attempts → fail gif, answer revealed.
6. Reload mid-game → board restored exactly.

**High-risk areas:**

| Area | Check |
|---|---|
| Persistence | Change username + theme, reload → both persist. Then clear localStorage in DevTools → clean fresh state, no crash. |
| Keyboard | Every AZERTY key types the right letter; `Backspace`, `Enter`, `←`, `→`, `Home`, `End` work. |
| Theme | Click the logo 4× → cycles all four with no unstyled flash. |
| Clue | Bulb reveals the letter under the cursor, count drops to 0 and disables. |
| Reroll | At 0 rerolls, clicking does nothing; god mode (`tgm`) makes it free. |
| God mode | Username `tgm` → word revealed; storage-clear button works. |
| Touch | Phone: tap keys, long-press backspace clears the row, double-tap locks a tile. |
| Wiki | Answer click → modal opens; ✕, backdrop click, and **Escape** all close it. Offline → "Définition introuvable". |
| Responsive | < 600 px → header shrinks, board + keyboard fit, no horizontal scroll. |

---

## 9. Dependency discipline

- `package-lock.json` is large; touching it produces a noisy diff. Only regenerate when a
  dependency genuinely must change, and call it out explicitly in the commit.
- Current locked versions: Svelte 5.16.0 · Vite 5.4.21 · SvelteKit 2.52.2 ·
  vite-plugin-svelte 4.0.4 · adapter-auto 3.3.1 · sveltestrap 6.2.7 · svelte-awesome 3.3.5.
- Do not upgrade Svelte 5.x minor versions casually — the app runs in legacy/compat mode and
  some deprecation warnings are load-bearing for the event-forwarding pattern.
