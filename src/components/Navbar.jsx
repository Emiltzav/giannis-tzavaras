import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Home } from 'lucide-react'
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

  // Single row of links (the full-width navbar gives enough room, so the old
  // stacked Books/Articles and Blog/Activities/Contact columns are gone).
  const navItems = [
    { to: '/', label: t.nav.home, icon: Home, end: true },
    { to: '/biography', label: t.nav.biography },
    { to: '/chronology', label: t.nav.chronology },
    { to: '/interests', label: t.nav.interests },
    { to: '/books', label: t.nav.books },
    { to: '/articles', label: t.nav.articles },
    { to: '/blog', label: t.nav.blog },
    { to: '/activities', label: t.nav.activities },
    { to: '/contact', label: t.nav.contact },
  ]

  const renderLink = (link) => {
    const IconCmp = link.icon
    return (
      <NavLink
        key={link.to}
        to={link.to}
        end={link.end}
        className={({ isActive }) =>
          `nav-link ${link.icon ? 'nav-link--home' : ''} ${isActive ? 'is-active' : ''}`
        }
      >
        {IconCmp && <IconCmp size={16} aria-hidden="true" />}
        {link.label}
      </NavLink>
    )
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Logo />

        <nav className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {navItems.map(renderLink)}
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
