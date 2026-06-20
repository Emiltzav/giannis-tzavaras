# CLAUDE.md

Guidance for Claude Code (and humans) working in this repository.

## Project

Personal website for **Giannis Tzavaras** (Γιάννης Τζαβάρας) — a modern Greek
philosopher, **Professor Emeritus of Philosophy at the University of Crete, Rethymno**
(now retired). The site presents his life, career, works, books/bibliography, articles,
and a blog, in the spirit of a *modern encyclopedia of philosophy* — evoking a world of
ideas, books, and Greek thinking culture.

## Original requirements (as requested by the owner)

These are the things the owner explicitly asked for. Keep them satisfied:

1. **This folder (`giannis-tzavaras`) is the repository.** It should be a GitHub repo.
2. **React JS website** for the philosopher Giannis Tzavaras.
3. Show his **works, articles, bibliography/books**; describe his **career and life**.
4. **Modern, beautiful design** that evokes *a world full of ideas, philosophy, books,
   Greek thinking culture* — encyclopedia-like.
5. **Bilingual**: Greek text by default with a **toggle to English via an EL / EN button
   (with flags)**.
6. **All text stored in JSON** (no hard-coded strings in components where avoidable).
7. **Frontend only** — **no backend and no database** for now.
8. **A blog** with posts from him (new posts can be added).
9. Use **logos / images / icons** related to philosophy.
10. He is a **retired Philosophy professor at the University of Crete, Rethymno**.

## What is implemented (status)

| Requirement | Status | Where |
| --- | --- | --- |
| Repo = this folder | ✅ git initialised | `.git`, `.gitignore` |
| React JS app | ✅ React 18 + Vite | `package.json`, `src/` |
| Works / Articles / Books / Bio | ✅ dedicated pages | `src/pages/*` |
| Career & life described (in words) | ✅ Biography + timeline | `src/pages/Biography.jsx`, `data/*.json` |
| Modern encyclopedia design | ✅ custom CSS design system | `src/index.css` |
| EL / EN toggle with flags | ✅ flag buttons, persisted | `src/components/LanguageToggle.jsx`, `public/flag-*.svg` |
| Text stored in JSON | ✅ mirrored EL/EN dictionaries | `src/data/el.json`, `src/data/en.json` |
| Frontend only, no backend/db | ✅ static SPA | — |
| Blog with posts | ✅ list + single post, reading time | `src/pages/Blog.jsx`, `BlogPost.jsx` |
| Logos / images / icons | ✅ owl-of-Athena logo, lucide icons, real photos | `public/owl.svg`, `lucide-react`, `public/images/*` |
| Retired prof, University of Crete | ✅ stated throughout | `data/*.json` |

### Pages added after the initial build
- **Broader Activities** (`/activities`, `src/pages/Activities.jsx`) — websites, institutional
  activities, and lectures. Content in `activities` key of `el.json`/`en.json`.
- **Chronology** (`/chronology`, `src/pages/Chronology.jsx`) — full year-by-year timeline
  1950→present (life milestones + complete bibliography). Data in the shared
  `src/data/chronology.json`; page labels in the `chronology` key of `el.json`/`en.json`.

### `yliko/` — the owner's content drop folder
The owner places source material (`.txt` etc.) in **`yliko/`** to be turned into site content.
First file: `yliko/xronologio.txt` → became `src/data/chronology.json`. When new files appear
there, read them and fold their content into the appropriate JSON/page. (`yliko/` is raw source
and is not rendered directly.)

### Books page data (Books + Translations tabs)
The **Books** page (`/books`) has a two-tab segmented switch: **Βιβλία / Books** and
**Μεταφράσεις / Translations**. `/translations` renders the same page with the translations
tab pre-selected (`<Books initialTab="translations" />`).
- Books → shared **`src/data/books.json`** (28 authored books, from `yliko/vivlia.txt`).
  Item: `{ year, title, subtitle?, publisher, pages?, note? }`.
- Translations → shared **`src/data/translations.json`** (22 translations, from
  `yliko/metafraseis.txt`). Item adds an `author` field (original author, shown as eyebrow):
  `{ year, author, title, subtitle?, publisher, pages?, note? }`.
Titles are kept in the original Greek/German for both languages; only UI labels (title, lead,
note, countLabel, tab labels, translations* labels, pagesLabel) live in the `books` key of
`el.json`/`en.json`. To add an entry, append to the relevant JSON file.

### chronology.json structure
Single shared file (not duplicated per language). Each entry: `{ year, items: [...] }`.
An item is either a **string** (a bibliographic entry, kept in original Greek for both
languages) or an **object** `{ milestone: true, el, en }` (a life event, shown translated and
highlighted with a badge). The page picks `item[lang]` for milestones.

### Real photographs
The owner added two real photos in `public/images/`:
- `IoannisTzavaras.jpg` — recent (Professor Emeritus) photo → used as the **main portrait**
  (hero + biography aside).
- `Giannis-Tzavaras.jpg` — younger black-and-white portrait → used as the **"early years"**
  historical photo in the Biography aside.

These are wired through `src/components/Portrait.jsx` (pass a `src` prop to choose one).

## Architecture

- **Stack**: React 18, Vite, React Router v6, `lucide-react` icons, plain CSS.
- **i18n**: `src/i18n/LanguageContext.jsx` provides `{ lang, setLang, toggle, t }`.
  `t` is the whole dictionary for the active language (`el.json` or `en.json`).
  Chosen language is saved to `localStorage` (`gt-lang`) and sets `<html lang>`.
- **Content**: everything textual lives in `src/data/el.json` + `src/data/en.json`,
  which **must keep an identical structure / array lengths** so switching language never
  breaks. IDs in `blog.posts` must match across both files (used in the URL).
- **Routing**: `/`, `/biography`, `/chronology`, `/works`, `/books`, `/articles`, `/blog`,
  `/blog/:id`, `/activities`, `/contact`, and a `*` 404. Defined in `src/App.jsx`.
- **Design system**: all in `src/index.css`. Palette = aegean blue + parchment + gold +
  terracotta; serif typography (Cormorant Garamond / Spectral, both support Greek);
  Greek-meander motifs; owl-of-Athena logo (`public/owl.svg`).

## Conventions

- **Add/edit content in JSON, not in JSX.** Mirror every change in both `el.json` and
  `en.json`.
- Keep the two dictionaries structurally identical (same keys, same array lengths).
- Components stay presentational; they read from `t` via `useLang()`.
- Icons come from `lucide-react` (mapped in `src/components/Icon.jsx` for content-driven icons).
- Respect `prefers-reduced-motion` (already handled in CSS); the `Reveal` component is
  the standard scroll-in animation wrapper.

## Common tasks

```bash
npm install      # install deps
npm run dev      # dev server → http://localhost:5173
npm run build    # production build → /dist
npm run preview  # preview the build
```

- **New blog post** → append an object to `blog.posts` in BOTH json files (same `id`,
  `date` as `YYYY-MM-DD`, `body` is an array of paragraph strings).
- **New book** → append to `books.items` (`type` is `"original"` or `"translation"`).
- **New article** → append to `articles.items`.
- **Swap a portrait** → drop the file in `public/images/` and pass its path as the `src`
  prop to `<Portrait />`.

## Important caveat — content accuracy

The biographical narrative, book titles, dates, publishers, journals and blog posts are
**plausible placeholders** written to populate and demonstrate the design. They are NOT
verified facts. **Replace them with accurate, sourced information before publishing.**
The two photographs are the only verified real assets so far.

## Not done yet / possible next steps

- Verify and replace placeholder biographical/bibliographic content with real data.
- Optional: deploy (e.g. GitHub Pages / Netlify / Vercel) — add a `base` in
  `vite.config.js` if hosting under a sub-path.
- Optional: real contact form (would need a backend or a 3rd-party form service).
- Optional: SEO/OG image, sitemap, favicon variants.
