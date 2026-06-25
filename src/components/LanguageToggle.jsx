import { Fragment } from 'react'
import { useLang } from '../i18n/LanguageContext.jsx'

const LANGS = [
  { code: 'el', label: 'EL', flag: 'flag-gr.svg', titleKey: 'greek', w: 22, h: 15 },
  { code: 'en', label: 'EN', flag: 'flag-gb.svg', titleKey: 'english', w: 22, h: 13 },
  { code: 'de', label: 'DE', flag: 'flag-de.svg', titleKey: 'german', w: 22, h: 14 },
]

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang, t } = useLang()

  return (
    <div
      className={`lang-toggle ${compact ? 'lang-toggle--compact' : ''}`}
      role="group"
      aria-label="Language / Γλώσσα / Sprache"
    >
      {LANGS.map((l, i) => (
        <Fragment key={l.code}>
          {i > 0 && <span className="lang-sep" aria-hidden="true">/</span>}
          <button
            type="button"
            className={`lang-btn ${lang === l.code ? 'is-active' : ''}`}
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            title={t.ui[l.titleKey]}
          >
            <img src={l.flag} alt="" aria-hidden="true" width={l.w} height={l.h} />
            <span>{l.label}</span>
          </button>
        </Fragment>
      ))}
    </div>
  )
}
