// Post-build step: inline the bundled JS and CSS into dist/index.html so the
// site can be opened directly from the filesystem (file://) by double-clicking
// index.html - no web server required.
//
// Why this is needed: browsers refuse to load external `<script type="module">`
// files over the file:// protocol (CORS / "origin null"). Inlining the module
// as an inline <script type="module"> sidesteps that, and inlining the CSS keeps
// everything self-contained. Images/SVGs stay as separate files (loaded with
// relative paths) since the browser loads those fine over file://.

import { readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')
const htmlPath = join(distDir, 'index.html')
let html = readFileSync(htmlPath, 'utf8')

// Inline the CSS <link ... href="./assets/xxx.css"> as a <style> block.
html = html.replace(
  /<link[^>]*rel="stylesheet"[^>]*href="\.\/(assets\/[^"]+\.css)"[^>]*>/g,
  (_m, href) => {
    const css = readFileSync(join(distDir, href), 'utf8')
    return `<style>\n${css}\n</style>`
  },
)

// Inline the module <script ... src="./assets/xxx.js"> as an inline module.
html = html.replace(
  /<script[^>]*type="module"[^>]*src="\.\/(assets\/[^"]+\.js)"[^>]*><\/script>/g,
  (_m, src) => {
    const js = readFileSync(join(distDir, src), 'utf8')
    return `<script type="module">\n${js}\n</script>`
  },
)

writeFileSync(htmlPath, html)

// The now-inlined files are no longer referenced - drop the assets folder.
rmSync(join(distDir, 'assets'), { recursive: true, force: true })

const remaining = readdirSync(distDir).join(', ')
console.log('\nStandalone build ready in dist/')
console.log('  Open dist/index.html directly in a browser (no server needed).')
console.log('  dist contents:', remaining)
