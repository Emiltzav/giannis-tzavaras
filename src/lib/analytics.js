import { supabase } from './supabase.js'

// -----------------------------------------------------------------------------
// Client-side page-view tracking. Everything here is best-effort and fire-and-
// forget: any failure (no config, offline, blocked request) is swallowed so the
// public site is never affected.
// -----------------------------------------------------------------------------

const VISITOR_KEY = 'gt-visitor-id'
const LANG_KEY = 'gt-lang' // same key the LanguageContext uses

// A stable-per-browser id → lets us count distinct visitors without storing IPs.
// Regenerated if the user clears storage / uses private mode (slightly over-counts).
function getVisitorId() {
    try {
        let id = localStorage.getItem(VISITOR_KEY)
        if (!id) {
            id = (crypto?.randomUUID?.() ?? fallbackUuid())
            localStorage.setItem(VISITOR_KEY, id)
        }
        return id
    } catch {
        return null // storage disabled → visitor just won't be de-duplicated
    }
}

function fallbackUuid() {
    // Only used on ancient browsers without crypto.randomUUID.
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
    })
}

// Compact User-Agent classification — enough for basic browser/OS/device stats
// without pulling in a heavy parser dependency.
function parseUserAgent(ua = navigator.userAgent || '') {
    const s = ua.toLowerCase()

    let deviceType = 'desktop'
    if (/bot|crawler|spider|crawling/.test(s)) deviceType = 'bot'
    else if (/ipad|tablet|(android(?!.*mobile))/.test(s)) deviceType = 'tablet'
    else if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(s)) deviceType = 'mobile'

    let os = 'Other'
    if (/windows/.test(s)) os = 'Windows'
    else if (/iphone|ipad|ipod/.test(s)) os = 'iOS'
    else if (/mac os x|macintosh/.test(s)) os = 'macOS'
    else if (/android/.test(s)) os = 'Android'
    else if (/linux/.test(s)) os = 'Linux'

    let browser = 'Other'
    if (/edg\//.test(s)) browser = 'Edge'
    else if (/opr\/|opera/.test(s)) browser = 'Opera'
    else if (/samsungbrowser/.test(s)) browser = 'Samsung Internet'
    else if (/firefox|fxios/.test(s)) browser = 'Firefox'
    else if (/chrome|crios/.test(s) && !/edg\//.test(s)) browser = 'Chrome'
    else if (/safari/.test(s) && !/chrome|crios/.test(s)) browser = 'Safari'

    return { browser, os, deviceType }
}

// Approximate country/city from the visitor's IP, resolved client-side by a free
// HTTPS+CORS geo API (no key, no backend). Best-effort with a short timeout.
async function lookupGeo() {
    try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 2500)
        const res = await fetch('https://ipwho.is/?fields=success,country,city', {
            signal: controller.signal,
        })
        clearTimeout(timer)
        const data = await res.json()
        if (data && data.success !== false) {
            return { country: data.country ?? null, city: data.city ?? null }
        }
    } catch {
        /* geo is optional — ignore failures */
    }
    return { country: null, city: null }
}

let lastTracked = null // guard against duplicate fires for the same path

/**
 * Records one page view. Call on every route change with the current path.
 * @param {string} page  full route, e.g. "/", "/books", "/blog/some-id"
 */
export async function trackPageView(page) {
    if (!supabase) return // analytics not configured → silently skip
    if (page === lastTracked) return // React StrictMode / same-path re-render guard
    lastTracked = page

    try {
        const lang = localStorage.getItem(LANG_KEY) || 'el'
        const params = new URLSearchParams(window.location.search)
        const source = params.get('utm_source') || params.get('source') || null
        const referrer = document.referrer || null
        const { browser, os, deviceType } = parseUserAgent()
        const { country, city } = await lookupGeo()

        await supabase.from('page_views').insert({
            page,
            lang,
            visitor_id: getVisitorId(),
            source,
            referrer,
            browser,
            os,
            device_type: deviceType,
            country,
            city,
        })
    } catch {
        /* fire-and-forget: never break the UI over analytics */
    }
}
