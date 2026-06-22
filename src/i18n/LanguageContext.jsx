import { createContext, useContext, useEffect, useState } from 'react'
import el from '../data/el.json'
import en from '../data/en.json'
import de from '../data/de.json'

const dictionaries = { el, en, de }
const LANGS = ['el', 'en', 'de']

const LanguageContext = createContext(null)

const STORAGE_KEY = 'gt-lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'el'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return LANGS.includes(stored) ? stored : 'el'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const toggle = () => setLang((prev) => LANGS[(LANGS.indexOf(prev) + 1) % LANGS.length])

  const value = {
    lang,
    setLang,
    toggle,
    t: dictionaries[lang],
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within a LanguageProvider')
  return ctx
}
