# Marvel Information Portal

A browser for Marvel characters and comics: pick a character to see its
description, alignment and power stats; browse comic editions and open one for
its cover, description and subjects.

React with Create React App, Sass, React Router 6 and a small `useHttp` hook
instead of a data library.

---

## Why it does not use the Marvel API

It used to. `gateway.marvel.com` now answers 5xx to everything, and **not
because of the key**:

| request | response |
|---|---|
| with the project's key, from a browser | 503 |
| with the same key, server-side | 500 |
| with a deliberately invalid key | 500 (a healthy API returns 401) |
| with no key at all | 500 (a healthy API returns 409) |

An invalid key and a missing key produce the same 500 as a valid one, so the
gateway itself is failing for everyone — there is nothing to work around in the
client. Checked 15 August 2026.

The app therefore reads from two public sources that need **no API key and no
registered referrer**:

- **Characters** — [akabab/superhero-api](https://github.com/akabab/superhero-api),
  a static JSON dataset of 563 heroes. The 269 published by Marvel Comics are
  the ones shown here.
- **Comics** — the [Open Library](https://openlibrary.org/developers/api) search
  API, queried for Marvel comics, with covers from `covers.openlibrary.org`.

Both are CORS-enabled, which was the deciding factor: Comic Vine has richer
comics data but blocks browser requests outright.

---

## What it does

- **Characters** — a paged list (nine at a time, "load more"), a random
  character banner, and a details panel with the character's real name, race,
  first appearance, affiliation, alignment and **power stats** as bars.
- **Comics** — a paged grid of editions with covers, author and year, and a
  single-edition page at `/comics/:comicId`.
- Loading states use skeletons and a spinner, failures fall back to an error
  component rather than a blank screen, an error boundary catches render errors,
  and an unknown address lands on a 404 page.

### The whole character dataset is fetched once

It is a single 900 KB file, so it is loaded on first use, filtered to Marvel and
sorted by name, then kept in memory. Paging, opening a character and the random
banner all read from that copy — the previous version made one request per
character click, and the random banner guessed an id inside a hard-coded range
and hoped it existed.

```
src/
  components/    app shell, header, banner, char list/info, comics list,
                 single comic, skeleton, spinner, error boundary, pages
  hooks/         http.hook.js — fetch wrapper with loading/error state
  services/      MarvelService.js — both data sources and the transforms
  style/         Sass variables, buttons, base styles
```

---

## Running it

Requires **Node 22** (the version the deployment builds with).

```bash
npm install
npm start
npm run build
```

No API key and no environment variables — both data sources are public. The
Marvel key and its `REACT_APP_MARVEL_API_KEY` override went away with the Marvel
API calls.

---

## Known limits

- **The comics section is book editions, not issues.** Open Library indexes
  published volumes, so a search for Marvel comics returns collections and
  graphic novels rather than individual numbered issues with prices.
- **The character dataset is fixed.** It is a snapshot in a GitHub repository,
  not a live service, so nothing new appears in it.
- **No caching between sessions** — the 900 KB dataset is refetched on a hard
  reload.
- **No tests.** The testing-library packages are installed but unused.
- **Create React App is no longer maintained upstream.** The build works and is
  pinned to Node 22; Vite is the obvious next step.

Character data © their respective rights holders; comics metadata from Open
Library.
