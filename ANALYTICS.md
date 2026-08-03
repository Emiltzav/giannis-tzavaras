# Website analytics (Supabase)

This site tracks basic traffic analytics with **no backend server** - the static React
app writes page-view events directly to a free **Supabase** (Postgres) database, and a
private in-app dashboard at **`/#/admin`** reads them back. Nothing else changes about
hosting: the site stays a static SPA on GitHub Pages.

## What gets tracked

One row per page view in the `page_views` table:

| Field | Meaning |
| --- | --- |
| `page` | full route, e.g. `/`, `/books`, `/blog/some-id` (per-page + per-post detail) |
| `lang` | UI language at view time (`el` / `en` / `de`) |
| `visitor_id` | random id kept in the browser's `localStorage` → counts **distinct visitors** |
| `source` | `utm_source` (or `?source=`) from the URL |
| `referrer` | where the visitor came from (`document.referrer`) |
| `browser` / `os` / `device_type` | parsed from the User-Agent |
| `country` / `city` | approximate, resolved client-side via the free `ipwho.is` API |
| `created_at` | timestamp |

Tracking is **fire-and-forget**: any failure (offline, blocked, not configured) is
swallowed and never affects the public site. The offline standalone build works unchanged
(it just records nothing).

> **Distinct-visitor accuracy.** `visitor_id` lives in `localStorage`, so it resets if the
> visitor clears storage or uses private mode (→ slight over-count), and is per-browser.
> It's the standard privacy-friendly approximation. The schema also keeps an unused
> `ip_hash` column, so switching to true IP-based counts later (via a Supabase Edge
> Function) needs no rework.

## One-time setup

1. **Create a project** at <https://supabase.com> (free tier). Pick the **Frankfurt / EU**
   region (closest to Greek visitors).
2. **Create the schema**: project → **SQL Editor** → paste all of
   [`supabase/schema.sql`](supabase/schema.sql) → **Run**. This creates the table, the
   Row-Level Security policies (public can only *insert*; only a logged-in user can *read*),
   and the aggregation functions the dashboard uses.
3. **Create your admin login**: **Authentication → Users → Add user** → your email +
   password. Then **Authentication → Providers → Email → disable "Enable sign ups"** so
   *only you* can ever log in.
4. **Wire up the keys**: **Settings → API** → copy the **Project URL** and the
   **anon public** key into a `.env` file (see [`.env.example`](.env.example)):

   ```
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```

   For the deployed GitHub Pages build, put the same two lines in **`.env.production`**
   (it's git-ignored) *or* inject them as build-time env vars in the GitHub Actions
   workflow before `npm run build`.

## Viewing the stats

Go to **`https://<your-site>/#/admin`**, sign in with the credentials from step 3, and you
get: total views, distinct visitors, blog views, views today, a views-per-day chart, and
breakdowns by page, blog post, language, country, browser, OS, device, referrer and UTM
source - plus a live table of recent visits. A range selector switches between 7/30/90/365
days and all-time. The `/admin` route is **not** in the navbar and records no analytics of
its own.

## Is the anon key safe to publish?

Yes. It's designed to be public. RLS (schema step 2) means the anon key can only *insert*
page-views and can never *read* them - reads require your authenticated session.
