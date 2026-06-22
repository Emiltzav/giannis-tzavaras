const LOCALES = { el: 'el-GR', en: 'en-GB', de: 'de-DE' }

export function formatDate(dateStr, lang) {
  const date = new Date(dateStr)
  return date.toLocaleDateString(LOCALES[lang] || 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function readingTime(body) {
  const words = (Array.isArray(body) ? body.join(' ') : String(body || ''))
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 180))
}
