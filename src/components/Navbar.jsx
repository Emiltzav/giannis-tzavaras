import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/biography', label: t.nav.biography },
    { to: '/chronology', label: t.nav.chronology },
    { to: '/works', label: t.nav.works },
    { to: '/books', label: t.nav.books },
    { to: '/articles', label: t.nav.articles },
    { to: '/blog', label: t.nav.blog },
    { to: '/activities', label: t.nav.activities },
    { to: '/contact', label: t.nav.contact },
  ]

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Logo />

        <nav className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="navbar__links-lang">
            <LanguageToggle />
          </div>
        </nav>

        <div className="navbar__actions">
          <div className="navbar__lang-desktop">
            <LanguageToggle />
          </div>
          <button
            type="button"
            className="navbar__burger"
            onClick={() => setOpen((v) => !v)}
            aria-label={t.ui.menu}
            aria-expanded={open}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  )
}
