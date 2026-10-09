---
description: Add French words to Motle's word lists (answerable pool and/or validation dictionary)
argument-hint: <word> [word2 word3 …]
allowed-tools: Read, Grep, Edit
---

Add French words to Motle's two word lists.

**Words to add:** `$ARGUMENTS`

If no arguments were supplied, ask which words to add before editing anything.

---

## Which list gets what

| Target | File | Effect |
|---|---|---|
| **Answerable** | `src/playableWords.js` | The word can be picked as the hidden answer |
| **Accepted** | `src/words.js` | The word is accepted as a submitted guess |

The naming is inverted from intuition — `playableWords.js` is the **small** curated pool
(20,887), `words.js` is the **huge** dictionary (78,847). Do not guess; verify by opening the
file.

Unless the user says otherwise, add each word to **both** — that makes it both answerable and
acceptable as a guess.

---

## Rules

1. **Uppercase ASCII only.** No accents, no hyphens, no apostrophes, no spaces.
   Words outside 5–8 letters are filtered out by `config.minLength` / `config.maxLength` and
   will never be used — flag this rather than adding them silently.
2. **Alphabetical position matters.** The files are sorted; insert each word in the correct
   spot among its neighbours.
3. **Match the exact line format** — 4-space indent, double quotes, trailing comma:

   ```js
       "ABACA",
   ```

   The last element has no trailing comma.
4. **Never run a formatter over these files.** A pass produces a multi-thousand-line diff that
   destroys reviewability.
5. **Small, surgical edits only.** Never rewrite, regenerate, re-sort, or "tidy" the file.

---

## Verify

```bash
npm run build
```

A single malformed line breaks the import for the entire application, and the build is the
only cheap way to catch it.

Then report:

- which words were added to which list
- the new entry count for each list
- any word that was skipped and why (wrong length, non-ASCII, already present)