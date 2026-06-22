# Γιάννης Τζαβάρας · Giannis Tzavaras

Personal website of **Giannis Tzavaras** — Greek philosopher, Professor Emeritus of
Philosophy at the **University of Crete (Rethymno)**. A trilingual
(Ελληνικά / English / Deutsch) digital archive of his work: biography, curriculum,
chronology, works, interests, books & bibliography, articles, and a blog.

Built as a **frontend-only** React application — no backend, no database. All textual
content lives in JSON files and the interface switches instantly between Greek, English
and German.

![owl of Athena](public/owl.svg)

## ✦ Original brief & status

What was requested, and where it lives (full developer notes in [`CLAUDE.md`](CLAUDE.md)):

| Requirement | Status |
| --- | --- |
| This folder is the Git repository | ✅ |
| React JS website about Giannis Tzavaras | ✅ React 18 + Vite |
| Show works, articles, books/bibliography; describe career & life | ✅ dedicated pages |
| Modern encyclopedia-of-philosophy design (ideas, books, Greek culture) | ✅ custom CSS design system |
| Greek by default + **EL / EN / DE toggle with flags** | ✅ persisted in `localStorage` |
| All text stored in **JSON** | ✅ `src/data/el.json`, `en.json`, `de.json` |
| **Frontend only** — no backend / database | ✅ static SPA |
| A **blog** with posts (extendable) | ✅ list + single-post views |
| Logos / images / icons related to philosophy | ✅ owl-of-Athena logo, lucide icons, real photos |
| Retired professor, University of Crete, Rethymno | ✅ throughout the content |

> ⚠️ Much of the biography, article details and blog texts are **plausible placeholders** to
> populate the design — replace them with verified information before publishing. The content
> sourced from the owner's own material (chronology, books, translations, broader activities,
> interests, CV) and the photographs in `public/images/` are real.

## ✦ Features

- **Trilingual EL / EN / DE** toggle (flag buttons), with the choice remembered in `localStorage`
  and reflected in `<html lang>`. Dates are localized per language (`el-GR`, `en-GB`, `de-DE`).
- **All content stored in JSON** — `src/data/el.json`, `en.json` and `de.json` keep an identical
  structure, plus shared data files (`books.json`, `translations.json`, `chronology.json`).
- **Pages**: Home, Biography (with timeline), Curriculum / CV, Chronology, Work, Interests,
  Books (with a Books / Translations tab switch), Articles, Blog + single posts, Broader
  Activities, and Contact.
- **Blog** with reading-time estimates, tags, and a clean reading view — add new posts by editing JSON.
- A warm, classical *"encyclopedia of ideas"* design: Greek-meander accents, marble & aegean-blue
  palette, Cormorant / Spectral serif typography, and a custom owl-of-Athena logo.
- Responsive, accessible, and animation-light (respects `prefers-reduced-motion`).

## ✦ Tech

- [React 18](https://react.dev/) + [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/) for client-side routing
- [lucide-react](https://lucide.dev/) for icons
- Plain CSS (custom design system in `src/index.css`) — no UI framework

## ✦ Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:5173
npm run build    # production build into /dist
npm run preview  # preview the production build
```

### View it on your phone (same Wi-Fi)

Expose the dev server on your local network and open the printed **Network** URL
(e.g. `http://192.168.1.9:5173`) on a device on the same Wi-Fi:

```bash
npm run dev -- --host
```

If the phone can't connect, allow the port through Windows Firewall (run as Administrator):

```bash
netsh advfirewall firewall add rule name="Vite 5173" dir=in action=allow protocol=TCP localport=5173
```

## ✦ Editing content

Most text lives in three language dictionaries that **must keep an identical structure**:

```
src/data/el.json   # Greek  (default)
src/data/en.json   # English
src/data/de.json   # German
```

Some content is language-neutral and lives in **shared** JSON files (titles are kept in their
original Greek/German for every language; only UI labels are translated in the dictionaries):

```
src/data/books.json         # authored books (Books page)
src/data/translations.json  # translations (Books → Translations tab)
src/data/chronology.json    # year-by-year timeline
```

> **Rule of thumb:** add/edit content in JSON, not in JSX, and mirror every change across all
> three dictionaries (same keys, same array lengths). Don't hardcode language-specific strings
> in components — add a key to the dictionaries instead.

### Add a blog post
Append an object to the `blog.posts` array in **all three** dictionaries (same `id`):

```jsonc
{
  "id": "my-new-post",          // used in the URL: /blog/my-new-post
  "date": "2026-06-20",
  "title": "…",
  "tags": ["…"],
  "excerpt": "…",
  "body": ["First paragraph…", "Second paragraph…"]
}
```

### Add a book / translation
Append to `src/data/books.json` or `src/data/translations.json` (shared, not per-language):

```jsonc
// books.json item
{ "year": "2009", "title": "…", "subtitle": "…", "publisher": "…", "pages": "186", "note": "…" }
// translations.json adds an `author` field (the original author)
{ "year": "1986", "author": "M. Heidegger", "title": "…", "publisher": "…", "pages": "…" }
```

### Add an article
Append to `articles.items` in all three dictionaries (`{ year, title, journal, description }`).

### Photographs
Real photographs live in `public/images/`:
- `IoannisTzavaras.jpg` — recent (Emeritus) photo, used as the main portrait.
- `Giannis-Tzavaras.jpg` — younger black-and-white portrait, shown as an "early years" image.
- `foto-giannis.jpg`, `giannis-rubik.jpg` — used on the **Interests** page.
- `yiannis-2009.jpg` — used on the **Curriculum / CV** page.

To use a different image, drop it in `public/images/` and pass its path to `<Portrait src="…" />`.

### `yliko/` — content drop folder
The owner places raw source material (`.txt`) in **`yliko/`**; it is read and folded into the
appropriate JSON/page (it is not rendered directly).

## ✦ Routing

`/`, `/biography`, `/cv`, `/chronology`, `/works`, `/interests`, `/books`, `/translations`,
`/articles`, `/blog`, `/blog/:id`, `/activities`, `/contact`, and a `*` 404. The **CV** page is
intentionally not in the main navbar (it's linked from the Biography page and the footer).

## ✦ Project structure

```
src/
  components/   Navbar, Footer, LanguageToggle, Logo, Portrait, Reveal, PageHeader, Icon, …
  data/         el.json, en.json, de.json  ← dictionaries
                books.json, translations.json, chronology.json  ← shared content
  i18n/         LanguageContext.jsx (EL/EN/DE provider)
  pages/        Home, Biography, CV, Chronology, Works, Interests, Books, Articles,
                Blog, BlogPost, Activities, Contact, NotFound
  utils/        format.js (localized dates, reading time)
  index.css     the full design system
public/         owl.svg, flag-gr.svg, flag-gb.svg, flag-de.svg
  images/       Giannis-Tzavaras.jpg, IoannisTzavaras.jpg, foto-giannis.jpg,
                giannis-rubik.jpg, yiannis-2009.jpg  ← real photos
```

---

*Made with love for philosophy — «Η φιλοσοφία δεν δίνει απαντήσεις· μας μαθαίνει να ρωτάμε σωστά.»*
