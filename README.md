# Γιάννης Τζαβάρας · Giannis Tzavaras

Personal website of **Giannis Tzavaras** — Greek philosopher, Professor Emeritus of
Philosophy at the **University of Crete (Rethymno)**. A bilingual (Ελληνικά / English)
digital archive of his work: biography, books & bibliography, articles, and a blog.

Built as a **frontend-only** React application — no backend, no database. All textual
content lives in JSON files and the interface switches instantly between Greek and English.

![owl of Athena](public/owl.svg)

## ✦ Original brief & status

What was requested, and where it lives (full developer notes in [`CLAUDE.md`](CLAUDE.md)):

| Requirement | Status |
| --- | --- |
| This folder is the Git repository | ✅ |
| React JS website about Giannis Tzavaras | ✅ React 18 + Vite |
| Show works, articles, books/bibliography; describe career & life | ✅ dedicated pages |
| Modern encyclopedia-of-philosophy design (ideas, books, Greek culture) | ✅ custom CSS design system |
| Greek by default + **EL / EN toggle with flags** | ✅ persisted in `localStorage` |
| All text stored in **JSON** | ✅ `src/data/el.json` & `en.json` |
| **Frontend only** — no backend / database | ✅ static SPA |
| A **blog** with posts (extendable) | ✅ list + single-post views |
| Logos / images / icons related to philosophy | ✅ owl-of-Athena logo, lucide icons, real photos |
| Retired professor, University of Crete, Rethymno | ✅ throughout the content |

> ⚠️ The biography, book/article details and blog texts are **plausible placeholders** to
> populate the design — replace them with verified information before publishing. The two
> photographs in `public/images/` are the only confirmed real assets.

## ✦ Features

- **Bilingual EL / EN** toggle (flag buttons), with the choice remembered in `localStorage`.
- **All content stored in JSON** — `src/data/el.json` and `src/data/en.json` (mirrored structure).
- **Pages**: Home, Biography (with timeline), Work, Books (filterable), Articles, Blog + single posts, Contact.
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

## ✦ Editing content

All text is in two JSON files with an identical structure:

```
src/data/el.json   # Greek
src/data/en.json   # English
```

### Add a blog post
Append an object to the `blog.posts` array in **both** files (same `id`):

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

### Add a book / article
Append to `books.items` / `articles.items` in both files. Books accept
`"type": "original"` or `"type": "translation"` (used by the filter).

### Portrait photos
Two real photographs live in `public/images/`:
- `IoannisTzavaras.jpg` — recent (Emeritus) photo, used as the main portrait.
- `Giannis-Tzavaras.jpg` — younger black-and-white portrait, shown as an "early years" image.

To use a different image, drop it in `public/images/` and pass its path to `<Portrait src="…" />`.

> **Note on content:** the biographical details, titles, dates and publishers included
> here are plausible **placeholders** to populate the design. Replace them with verified
> information before publishing.

## ✦ Project structure

```
src/
  components/   Navbar, Footer, LanguageToggle, Logo, Portrait, Reveal, …
  data/         el.json, en.json  ← all content
  i18n/         LanguageContext.jsx (EL/EN provider)
  pages/        Home, Biography, Works, Books, Articles, Blog, BlogPost, Contact
  utils/        format.js (dates, reading time)
  index.css     the full design system
public/         owl.svg, flag-gr.svg, flag-gb.svg
  images/       Giannis-Tzavaras.jpg, IoannisTzavaras.jpg  ← real photos
```

---

*Made with love for philosophy — «Η φιλοσοφία δεν δίνει απαντήσεις· μας μαθαίνει να ρωτάμε σωστά.»*
