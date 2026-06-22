import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="page">
      <div className="container narrow empty-state">
        <img src="/owl.svg" alt="" aria-hidden="true" width="72" height="72" />
        <h1 className="empty-state__code">404</h1>
        <p className="empty-state__text">{t.ui.notFound}</p>
        <Link to="/" className="btn btn--primary">
          <Home size={18} /> {t.nav.home}
        </Link>
      </div>
    </div>
  )
}
