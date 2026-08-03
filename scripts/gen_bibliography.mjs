// Build-time parser for the "Greek Philosophical Bibliography" .doc archives.
//
// Two divisions, both in greek-bibliography/:
//   • books    (elliniki-philosophiki-bibliografia/, 5 files) - entries grouped by
//              the philosophical taxonomy; section detected by matching the heading
//              title against src/data/bibliography.json (body numbering is unreliable).
//   • articles (elliniki-philosophiki-arthrografia/, 4 files) - entries grouped by
//              YEAR (each file lists 1980, 1981, … with alphabetical entries below).
//
// Extracts text with `antiword -m UTF-8.txt`, de-wraps antiword's hard wrapping,
// splits entries on blank lines / bullets / column-0 starts, and writes one JSON
// per period into src/data/bibliography/<division>/ + an index.json manifest.
// Frontend-only: runs offline at build time (mirrors the yliko/ pipeline).
//
//   Usage:  node scripts/gen_bibliography.mjs
//   Deps:   antiword on PATH.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { dewrap, isJunk, isYearHeading, extractAuthorYear } from '../src/lib/bibliographyParse.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const GB = path.join(ROOT, 'greek-bibliography')
const OUT = path.join(ROOT, 'src', 'data', 'bibliography')

const BOOKS_DIR = path.join(GB, 'elliniki-philosophiki-bibliografia')
const ARTICLES_DIR = path.join(GB, 'elliniki-philosophiki-arthrografia')

const BOOK_FILES = [
  { id: '1980-1989', label: '1980-1989', file: 'Greek Philosophy 1980-89 (2019).doc' },
  { id: '1990-1999', label: '1990-1999', file: 'Greek Philosophy 1990-99 (2019).doc' },
  { id: '2000-2009', label: '2000-2009', file: 'Greek Philosophy 2000-09 (2019).doc' },
  { id: '2010-2019a', label: '2010-2019 (I)', file: 'Greek Philosophy 2010-2019 (1).doc' },
  { id: '2010-2019b', label: '2010-2019 (II)', file: 'Greek Philosophy 2010-2019 (2).doc' },
]
const ARTICLE_FILES = [
  { id: '1980-1989', label: '1980-1989', file: 'Arthrografia_1980-1989 (2020).doc' },
  { id: '1990-1999', label: '1990-1999', file: 'Arthrografia_1990-1999 (2020).doc' },
  { id: '2000-2009', label: '2000-2009', file: 'Arthrografia_2000-2009 (2020).doc' },
  { id: '2010-2019', label: '2010-2019', file: 'Arthrografia_2010-2019 (2020).doc' },
]

// ── Canonical taxonomy → normalized-title lookup (books only) ───────────────
const taxonomy = JSON.parse(fs.readFileSync(path.join(OUT + '.json'), 'utf8'))

function normTitle(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[\u2010-\u2015]/g, '-')
    .toLowerCase()
    .replace(/[^a-zα-ω0-9-]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const titleToSection = new Map()
;(function walk(nodes) {
  for (const n of nodes) {
    titleToSection.set(normTitle(n.title.el), { code: n.code, title: n.title.el })
    if (n.children) walk(n.children)
  }
})(taxonomy.categories)

function asHeading(para) {
  const m = para.match(/^((?:[0-9]+|[IVXΙ]+)(?:\s*\.\s*[0-9]+)*)\s*\.?\s+(.+)$/)
  if (!m) return null
  return titleToSection.get(normTitle(m[2])) || null
}

function findBooksBodyStart(lines) {
  let firstCode = null
  let last = 0
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (!l.trim() || /^\s/.test(l)) continue
    const h = asHeading(l)
    if (!h) continue
    if (firstCode === null) firstCode = h.code
    if (h.code === firstCode) last = i
  }
  return last
}

function makeEntry(id, section, para) {
  const { author, year } = extractAuthorYear(para, section.year ?? null)
  return { id, sectionCode: section.code, sectionTitle: section.title, author, year, text: para }
}

// ── Books: sections from the taxonomy ───────────────────────────────────────
function parseBooks(meta) {
  const raw = execFileSync('antiword', ['-m', 'UTF-8.txt', path.join(BOOKS_DIR, meta.file)], {
    maxBuffer: 1 << 29,
  }).toString('utf8')
  const lines = raw.split(/\r?\n/)
  const paras = dewrap(lines, findBooksBodyStart(lines))
  const entries = []
  let cur = null
  let seq = 0
  for (const para of paras) {
    const head = asHeading(para)
    if (head) {
      cur = head
      continue
    }
    if (isJunk(para)) continue
    entries.push(makeEntry(`b-${meta.id}-${seq++}`, cur || { code: '?', title: 'Άταξη' }, para))
  }
  return entries
}

// ── Articles: sections are YEARS ────────────────────────────────────────────
function parseArticles(meta) {
  const raw = execFileSync('antiword', ['-m', 'UTF-8.txt', path.join(ARTICLES_DIR, meta.file)], {
    maxBuffer: 1 << 29,
  }).toString('utf8')
  const lines = raw.split(/\r?\n/)
  const paras = dewrap(lines, 0)
  const entries = []
  let cur = null // { code, title, year } for the current year
  let seq = 0
  for (const para of paras) {
    if (isYearHeading(para)) {
      cur = { code: para, title: para, year: Number(para) }
      continue
    }
    if (!cur) continue // still in the preamble
    if (isJunk(para)) continue
    entries.push(makeEntry(`a-${meta.id}-${seq++}`, cur, para))
  }
  return entries
}

// ── Run both divisions ──────────────────────────────────────────────────────
function build(division, files, parse) {
  const dir = path.join(OUT, division)
  fs.mkdirSync(dir, { recursive: true })
  const manifest = []
  let total = 0
  for (const meta of files) {
    const entries = parse(meta)
    total += entries.length
    fs.writeFileSync(
      path.join(dir, `${meta.id}.json`),
      JSON.stringify({ id: meta.id, label: meta.label, division, entries }),
    )
    manifest.push({ id: meta.id, label: meta.label, count: entries.length })
    console.log(`  ${division.padEnd(9)} ${meta.label.padEnd(15)} ${String(entries.length).padStart(6)} entries`)
  }
  fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ division, periods: manifest }))
  return total
}

console.log('Parsing greek-bibliography/ …')
const b = build('books', BOOK_FILES, parseBooks)
const a = build('articles', ARTICLE_FILES, parseArticles)
console.log('─'.repeat(52))
console.log(`TOTAL: ${b} book entries + ${a} article entries = ${b + a}`)
