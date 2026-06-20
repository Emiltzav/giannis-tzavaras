import { createContext, useContext, useEffect, useState } from 'react'
import el from '../data/el.json'
import en from '../data/en.json'

const dictionaries = { el, en }

const LanguageContext = createContext(null)

const STORAGE_KEY = 'gt-lang'

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'el'
    return window.localStorage.getItem(STORAGE_KEY) || 'el'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang)
    document.documentElement.lang = lang
  }, [lang])

  const toggle = () => setLang((prev) => (prev === 'el' ? 'en' : 'el'))

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
