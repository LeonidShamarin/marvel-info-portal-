# Marvel Information Portal

A browser for Marvel characters and comics, built on the official
[Marvel Comics API](https://developer.marvel.com/). Pick a character to see its
description, homepage, wiki link and the comics it appears in; browse the comics
list and open a single issue.

React 18-era Create React App with Sass, React Router 6 and a small
`useHttp` hook instead of a data library.

---

## ⚠️ The Marvel API is currently returning 5xx

Every request to `gateway.marvel.com` fails right now, and **not because of the
key**:

| request | response |
|---|---|
| with this project's key, from a browser | 503 |
| with the same key, server-side | 500 |
| with a deliberately invalid key | 500 (an invalid key returns 401 when the API is healthy) |
| with no key at all | 500 (a missing key returns 409 when the API is healthy) |

An invalid key and a missing key produce the same 500 as a valid one, so the
gateway itself is failing for everyone. Nothing in this repository can work
around that — the app shows its error state, which is the correct behaviour.

Checked 15 August 2026.

---

## What it does

- **Characters** — a paged list (nine at a time, "load more"), a random
  character banner, and a details panel with description, links and the comics
  a character appears in.
- **Comics** — a paged grid, and a single-issue page at `/comics/:comicId`.
- Loading states use skeletons and a spinner; failures fall back to an error
  component rather than a blank screen, and an error boundary catches render
  errors.

```
src/
  components/    app shell, header, banner, char list/info, comics list,
                 single comic, skeleton, spinner, error boundary
  hooks/         http.hook.js — fetch wrapper with loading/error state
  services/      MarvelService.js — endpoints and response mapping
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

### About the API key

Marvel issues a **public** and a **private** key. Browser applications use the
public key, and requests are authorised by domain: the site's host has to be
listed under **Authorized Referrers** in the Marvel developer account. That is
why the key sits in the client bundle by design — it is useless from any other
domain.

The key can be overridden without editing code:

```
REACT_APP_MARVEL_API_KEY=your_public_key
```

Set it in `.env.local` locally, or in the host's environment variables. If it is
absent, the key committed here is used.

**When deploying to a new domain, add that domain to Authorized Referrers**
(`https://developer.marvel.com/account`), otherwise every request comes back
with 409 — the failure looks exactly like a broken app.

---

## Known limits

- **No caching.** Every navigation refetches; the `useHttp` hook holds no cache.
- **No tests.** The testing-library packages are installed but unused.
- **Create React App is no longer maintained upstream.** The build works and is
  pinned to Node 22; Vite is the obvious next step.

Data provided by Marvel. © 2014 Marvel
