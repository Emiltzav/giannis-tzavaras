-- =============================================================================
-- Giannis Tzavaras website — analytics schema for Supabase (Postgres)
-- -----------------------------------------------------------------------------
-- HOW TO USE
--   1. Create a free project at https://supabase.com  (region: Europe / Frankfurt
--      is closest to Greek visitors).
--   2. Open the project → SQL Editor → New query → paste this whole file → Run.
--   3. Create your admin login:  Authentication → Users → "Add user" → enter your
--      email + password. Turn OFF public sign-ups:  Authentication → Providers →
--      Email → disable "Enable sign ups"  (so only YOU can ever log in).
--   4. Copy Project URL + the "anon public" API key (Settings → API) into the
--      site's .env  (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
--
-- SECURITY MODEL (Row-Level Security)
--   • The public (anonymous) key may ONLY INSERT page-view rows.
--   • Nobody anonymous can read the data.
--   • Only a logged-in user (you) can SELECT — the admin dashboard reads via your
--     authenticated session, never via the anon key.
-- =============================================================================

create table if not exists public.page_views (
    id          bigint generated always as identity primary key,

    page        text,                       -- full route, e.g. '/', '/books', '/blog/some-id'
    lang        text,                       -- 'el' | 'en' | 'de'
    visitor_id  uuid,                       -- client-generated id (localStorage) → distinct visitors

    source      text,                       -- utm_source from the URL
    referrer    text,                       -- document.referrer

    browser     text,                       -- 'Chrome' | 'Safari' | ...
    os          text,                       -- 'Windows' | 'macOS' | 'Android' | 'iOS' | ...
    device_type text,                       -- 'desktop' | 'mobile' | 'tablet' | 'bot'

    country     text,                       -- resolved client-side via a free IP-geo API
    city        text,

    -- Reserved for a possible future Supabase Edge Function that hashes the real IP.
    ip_hash     text,

    created_at  timestamptz not null default now()
);

create index if not exists idx_pv_created on public.page_views (created_at);
create index if not exists idx_pv_page    on public.page_views (page);
create index if not exists idx_pv_visitor on public.page_views (visitor_id);

-- --- Row-Level Security ------------------------------------------------------
alter table public.page_views enable row level security;

-- Anyone (anon key) may record a page view...
drop policy if exists "public can insert page views" on public.page_views;
create policy "public can insert page views"
    on public.page_views for insert
    to anon, authenticated
    with check (true);

-- ...but only a logged-in user (you, the admin) may read them.
drop policy if exists "authenticated can read page views" on public.page_views;
create policy "authenticated can read page views"
    on public.page_views for select
    to authenticated
    using (true);

-- =============================================================================
-- Aggregation helpers (SECURITY DEFINER so the dashboard can call them while RLS
-- still blocks raw reads for anon). Each returns label/count pairs the admin page
-- renders as bars. `days` filters to the last N days (0 or null = all time).
-- =============================================================================

-- `uniq` = false → count every page view (raw hits);
-- `uniq` = true  → count DISTINCT visitors (so 20 hits from one visitor count once).
create or replace function public.pv_breakdown(col text, days int default 0, lim int default 20, uniq boolean default false)
returns table(label text, count bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
    -- Only allow a fixed set of columns (prevents SQL injection via `col`).
    if col not in ('page','lang','source','referrer','browser','os','device_type','country','city') then
        raise exception 'invalid column %', col;
    end if;

    return query execute format(
        'select coalesce(nullif(%I::text, %L), %L) as label, %s as count
           from public.page_views
          where (%s = 0 or created_at >= now() - make_interval(days => %s))
          group by 1 order by 2 desc limit %s',
        col, '', '—',
        case when uniq then 'count(distinct visitor_id)::bigint' else 'count(*)::bigint' end,
        days, days, lim
    );
end;
$$;

-- Daily totals (date + count) for the last N days, gap-filled to a continuous series.
-- `uniq` = true counts distinct visitors per day instead of raw views.
create or replace function public.pv_daily(days int default 30, uniq boolean default false)
returns table(day date, views bigint)
language sql
security definer
set search_path = public
as $$
    select d::date as day,
           case when uniq then count(distinct pv.visitor_id) else count(pv.id) end::bigint as views
      from generate_series(current_date - (days - 1), current_date, interval '1 day') d
      left join public.page_views pv
             on pv.created_at::date = d::date
     group by d
     order by d;
$$;

-- Headline totals in one row.
create or replace function public.pv_totals(days int default 0)
returns table(total_views bigint, unique_visitors bigint, blog_views bigint, today_views bigint)
language sql
security definer
set search_path = public
as $$
    select
        count(*)::bigint,
        count(distinct visitor_id)::bigint,
        count(*) filter (where page like '/blog/%')::bigint,
        count(*) filter (where created_at::date = current_date)::bigint
      from public.page_views
     where (days = 0 or created_at >= now() - make_interval(days => days));
$$;

-- Let logged-in users (you) call the helpers.
grant execute on function public.pv_breakdown(text, int, int, boolean) to authenticated;
grant execute on function public.pv_daily(int, boolean)               to authenticated;
grant execute on function public.pv_totals(int)                       to authenticated;
