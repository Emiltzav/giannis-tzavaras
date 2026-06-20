import { useLang } from '../i18n/LanguageContext.jsx'

export default function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useLang()

  return (
    <div className={`lang-toggle ${compact ? 'lang-toggle--compact' : ''}`} role="group" aria-label="Language / Γλώσσα">
      <button
        type="button"
        className={`lang-btn ${lang === 'el' ? 'is-active' : ''}`}
        onClick={() => setLang('el')}
        aria-pressed={lang === 'el'}
        title="Ελληνικά"
      >
        <img src="/flag-gr.svg" alt="" aria-hidden="true" width="22" height="15" />
        <span>EL</span>
      </button>
      <span className="lang-sep" aria-hidden="true">/</span>
      <button
        type="button"
        className={`lang-btn ${lang === 'en' ? 'is-active' : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        title="English"
      >
        <img src="/flag-gb.svg" alt="" aria-hidden="true" width="22" height="13" />
        <span>EN</span>
      </button>
    </div>
  )
}
