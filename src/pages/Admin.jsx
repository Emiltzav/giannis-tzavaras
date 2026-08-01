import { useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import './Admin.css'

// -----------------------------------------------------------------------------
// Private analytics dashboard (route: #/admin, not linked in the navbar).
// Auth is Supabase Auth: log in with the email/password you created in the
// Supabase dashboard. Row-Level Security means only a logged-in user can read
// the data, so this page is useless to anyone without your credentials.
//
// Kept deliberately self-contained and English-only — it's an internal tool, so
// it stays out of the trilingual el/en/de JSON dictionaries.
// -----------------------------------------------------------------------------

const RANGES = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 },
    { label: 'All time', days: 0 },
]

export default function Admin() {
    const [session, setSession] = useState(null)
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        if (!supabase) {
            setChecking(false)
            return
        }
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setChecking(false)
        })
        const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
        return () => sub.subscription.unsubscribe()
    }, [])

    if (!isSupabaseConfigured) {
        return (
            <div className="admin-wrap">
                <div className="admin-card admin-note">
                    <h1>Analytics not configured</h1>
                    <p>
                        Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in
                        your <code>.env</code>, then rebuild. See <code>supabase/schema.sql</code> and
                        the analytics section of <code>CLAUDE.md</code>.
                    </p>
                </div>
            </div>
        )
    }

    if (checking) return <div className="admin-wrap"><p className="admin-muted">Loading…</p></div>

    return session ? <Dashboard onSignOut={() => supabase.auth.signOut()} /> : <Login />
}

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        setBusy(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) setError(error.message)
        setBusy(false)
    }

    return (
        <div className="admin-wrap admin-wrap--center">
            <form className="admin-card admin-login" onSubmit={submit}>
                <h1>Analytics — Sign in</h1>
                <label>
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
                </label>
                <label>
                    Password
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </label>
                {error && <p className="admin-error">{error}</p>}
                <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
            </form>
        </div>
    )
}

function Dashboard({ onSignOut }) {
    const [days, setDays] = useState(30)
    const [uniq, setUniq] = useState(true) // true = distinct visitors, false = raw views
    const [data, setData] = useState(null)
    const [recent, setRecent] = useState([])
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState('')

    // Logging in marks THIS browser as the owner's, so your own future visits to
    // the public site are never recorded (see analytics.js opt-out).
    useEffect(() => {
        try { localStorage.setItem('gt-dnt', '1') } catch { /* storage disabled */ }
    }, [])

    const load = useCallback(async () => {
        setLoading(true)
        setErr('')
        try {
            const breakdown = (col, lim = 20) =>
                supabase.rpc('pv_breakdown', { col, days, lim, uniq })

            const [totals, daily, lang, page, browser, os, device, country, source, referrer, recentRows] =
                await Promise.all([
                    supabase.rpc('pv_totals', { days }),
                    supabase.rpc('pv_daily', { days: days || 30, uniq }),
                    breakdown('lang'),
                    breakdown('page', 50),
                    breakdown('browser'),
                    breakdown('os'),
                    breakdown('device_type'),
                    breakdown('country'),
                    breakdown('source'),
                    breakdown('referrer'),
                    supabase
                        .from('page_views')
                        .select('created_at,page,lang,browser,os,device_type,country,city,referrer,source')
                        .order('created_at', { ascending: false })
                        .limit(30),
                ])

            const firstError = [totals, daily, lang, page, recentRows].find((r) => r.error)
            if (firstError?.error) throw firstError.error

            const pages = page.data || []
            setData({
                totals: totals.data?.[0] || {},
                daily: daily.data || [],
                lang: lang.data || [],
                page: pages,
                topBlog: pages.filter((r) => r.label?.startsWith('/blog/')).slice(0, 10),
                browser: browser.data || [],
                os: os.data || [],
                device: device.data || [],
                country: country.data || [],
                source: source.data || [],
                referrer: referrer.data || [],
            })
            setRecent(recentRows.data || [])
        } catch (e) {
            setErr(e.message || 'Failed to load analytics.')
        }
        setLoading(false)
    }, [days, uniq])

    useEffect(() => { load() }, [load])

    const t = data?.totals || {}

    return (
        <div className="admin-wrap">
            <header className="admin-head">
                <h1>Website analytics</h1>
                <div className="admin-head__actions">
                    <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                        {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
                    </select>
                    <select value={uniq ? '1' : '0'} onChange={(e) => setUniq(e.target.value === '1')} title="Count distinct visitors, or every page load">
                        <option value="1">Distinct visitors</option>
                        <option value="0">All page views</option>
                    </select>
                    <button onClick={load} className="admin-btn">Refresh</button>
                    <button onClick={onSignOut} className="admin-btn admin-btn--ghost">Sign out</button>
                </div>
            </header>

            {err && <p className="admin-error">{err}</p>}
            {loading && <p className="admin-muted">Loading…</p>}

            {data && (
                <>
                    <section className="admin-cards">
                        <Stat label="Distinct visitors" value={t.unique_visitors} />
                        <Stat label="Total views" value={t.total_views} />
                        <Stat label="Blog views" value={t.blog_views} />
                        <Stat label="Views today" value={t.today_views} />
                    </section>

                    <DailyChart points={data.daily} label={uniq ? 'Distinct visitors per day' : 'Page views per day'} />

                    <div className="admin-grid">
                        <Breakdown title="Pages" rows={data.page} />
                        <Breakdown title="Top blog posts" rows={data.topBlog} />
                        <Breakdown title="Languages" rows={data.lang} />
                        <Breakdown title="Countries" rows={data.country} />
                        <Breakdown title="Browsers" rows={data.browser} />
                        <Breakdown title="Operating systems" rows={data.os} />
                        <Breakdown title="Devices" rows={data.device} />
                        <Breakdown title="Referrers" rows={data.referrer} />
                        <Breakdown title="Campaign sources (UTM)" rows={data.source} />
                    </div>

                    <RecentTable rows={recent} />
                </>
            )}
        </div>
    )
}

function Stat({ label, value }) {
    return (
        <div className="admin-card admin-stat">
            <span className="admin-stat__value">{Number(value ?? 0).toLocaleString()}</span>
            <span className="admin-stat__label">{label}</span>
        </div>
    )
}

function Breakdown({ title, rows }) {
    const max = Math.max(1, ...rows.map((r) => Number(r.count)))
    return (
        <div className="admin-card admin-breakdown">
            <h2>{title}</h2>
            {rows.length === 0 && <p className="admin-muted">No data yet.</p>}
            <ul>
                {rows.map((r, i) => (
                    <li key={i}>
                        <span className="admin-bar" style={{ width: `${(Number(r.count) / max) * 100}%` }} />
                        <span className="admin-bar__label" title={r.label}>{r.label || '—'}</span>
                        <span className="admin-bar__count">{Number(r.count).toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function DailyChart({ points, label = 'Views per day' }) {
    const max = Math.max(1, ...points.map((p) => Number(p.views)))
    return (
        <div className="admin-card admin-daily">
            <h2>{label}</h2>
            <div className="admin-daily__bars">
                {points.map((p) => (
                    <div className="admin-daily__col" key={p.day} title={`${p.day}: ${p.views}`}>
                        <div className="admin-daily__bar" style={{ height: `${(Number(p.views) / max) * 100}%` }} />
                    </div>
                ))}
            </div>
            {points.length > 0 && (
                <div className="admin-daily__axis">
                    <span>{points[0].day}</span>
                    <span>{points[points.length - 1].day}</span>
                </div>
            )}
        </div>
    )
}

function RecentTable({ rows }) {
    return (
        <div className="admin-card admin-recent">
            <h2>Recent visits</h2>
            <div className="admin-table-scroll">
                <table>
                    <thead>
                        <tr>
                            <th>Time</th><th>Page</th><th>Lang</th><th>Country</th>
                            <th>City</th><th>Device</th><th>Browser</th><th>OS</th><th>Referrer</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i}>
                                <td>{new Date(r.created_at).toLocaleString()}</td>
                                <td>{r.page}</td>
                                <td>{r.lang}</td>
                                <td>{r.country || '—'}</td>
                                <td>{r.city || '—'}</td>
                                <td>{r.device_type}</td>
                                <td>{r.browser}</td>
                                <td>{r.os}</td>
                                <td className="admin-ref" title={r.referrer || ''}>{r.referrer || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
