import { useState, useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Home, ChevronDown } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import LanguageToggle from './LanguageToggle.jsx'
import Logo from './Logo.jsx'

export default function Navbar() {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
    setOpenMenu(null)
  }, [location.pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Grouped nav: two dropdowns ("about" = life pages, "works" = the writings)
  // keep the top row short so the language flags always fit on one line.
  const navItems = [
    { to: '/', label: t.nav.home, icon: Home, end: true },
    {
      key: 'about',
      label: t.nav.about,
      children: [
        { to: '/biography', label: t.nav.biography },
        { to: '/chronology', label: t.nav.chronology },
        { to: '/interests', label: t.nav.interests },
        { to: '/cv', label: t.nav.cv },
      ],
    },
    {
      key: 'works',
      label: t.nav.works,
      children: [
        { to: '/books', label: t.nav.books },
        { to: '/articles', label: t.nav.articles },
      ],
    },
    { to: '/bibliography', label: t.nav.bibliography },
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

  const renderItem = (item) => {
    if (item.children) {
      return (
        <NavDropdown
          key={item.key}
          item={item}
          isOpen={openMenu === item.key}
          onOpen={() => setOpenMenu(item.key)}
          onClose={() => setOpenMenu((v) => (v === item.key ? null : v))}
          onToggle={() =>
            setOpenMenu((v) => (v === item.key ? null : item.key))
          }
        />
      )
    }
    return renderLink(item)
  }

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner container">
        <Logo />

        <nav className={`navbar__links ${open ? 'is-open' : ''}`} aria-label="Primary">
          {navItems.map(renderItem)}
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

function NavDropdown({ item, isOpen, onOpen, onClose, onToggle }) {
  const ref = useRef(null)
  const location = useLocation()

  // Close when clicking/tabbing outside (desktop). Harmless on mobile where the
  // panel is always expanded via CSS.
  useEffect(() => {
    if (!isOpen) return
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('pointerdown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  // Is any child route the active one? Highlight the toggle if so.
  const anyActive = item.children.some(
    (c) => location.pathname === c.to || location.pathname.startsWith(c.to + '/')
  )

  return (
    <div
      ref={ref}
      className={`nav-dropdown ${isOpen ? 'is-open' : ''}`}
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className={`nav-link nav-dropdown__toggle ${anyActive ? 'is-active' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={onToggle}
      >
        {item.label}
        <ChevronDown size={15} aria-hidden="true" className="nav-dropdown__chev" />
      </button>

      <div className="nav-dropdown__panel" role="menu">
        {item.children.map((c) => (
          <NavLink
            key={c.to}
            to={c.to}
            role="menuitem"
            className={({ isActive }) =>
              `nav-dropdown__item ${isActive ? 'is-active' : ''}`
            }
          >
            {c.label}
          </NavLink>
        ))}
      </div>
    </div>
  )
}
