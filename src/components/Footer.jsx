import { Link } from 'react-router-dom'
import { Mail, MapPin } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  const links = [
    { to: '/biography', label: t.nav.biography },
    { to: '/cv', label: t.nav.cv },
    { to: '/chronology', label: t.nav.chronology },
    { to: '/interests', label: t.nav.interests },
    { to: '/books', label: t.nav.books },
    { to: '/articles', label: t.nav.articles },
    { to: '/bibliography', label: t.nav.bibliography },
    { to: '/blog', label: t.nav.blog },
    { to: '/activities', label: t.nav.activities },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <footer className="footer">
      <div className="footer__meander" aria-hidden="true" />
      <div className="container footer__grid">
        <div className="footer__brand">
          <div className="footer__brand-row">
            <img src="owl.svg" alt="" aria-hidden="true" width="44" height="44" />
            <div>
              <p className="footer__name">{t.meta.name}</p>
              <p className="footer__role">{t.meta.role}</p>
            </div>
          </div>
          <p className="footer__tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">{t.footer.explore}</h3>
          <ul>
            {links.map((l) => (
              <li key={l.to}>
                <Link to={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h3 className="footer__heading">{t.footer.about}</h3>
          <p className="footer__about">{t.footer.aboutText}</p>
          <p className="footer__contact">
            <Mail size={15} aria-hidden="true" />
            <a href={`mailto:${t.contact.email}`}>{t.contact.email}</a>
          </p>
          <p className="footer__contact">
            <MapPin size={15} aria-hidden="true" />
            <span>{t.meta.place}</span>
          </p>
        </div>
      </div>

      <div className="container footer__bottom">
        <span>© {year} {t.meta.name}. {t.footer.rights}</span>
        <span className="footer__built">{t.footer.builtWith}</span>
      </div>
    </footer>
  )
}
