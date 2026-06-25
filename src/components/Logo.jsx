import { Link } from 'react-router-dom'
import { useLang } from '../i18n/LanguageContext.jsx'

export default function Logo({ onClick }) {
  const { t } = useLang()
  return (
    <Link to="/" className="logo" onClick={onClick} aria-label={t.meta.name}>
      <img src="owl.svg" alt="" aria-hidden="true" className="logo__mark" width="40" height="40" />
      <span className="logo__text">
        <span className="logo__name">{t.meta.name}</span>
        <span className="logo__role">{t.meta.place}</span>
      </span>
    </Link>
  )
}
