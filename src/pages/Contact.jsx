import { Mail, MapPin, Info } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'

export default function Contact() {
  const { t } = useLang()
  const c = t.contact

  const rows = [
    { icon: Mail, label: c.emailLabel, value: c.email, href: `mailto:${c.email}` },
    { icon: MapPin, label: c.locationLabel, value: c.location },
  ]

  return (
    <article className="page">
      <PageHeader kicker={t.nav.contact} title={c.title} lead={c.lead} />

      <section className="section">
        <div className="container narrow">
          <div className="contact__card card">
            <ul className="contact__list">
              {rows.map((row) => {
                const RowIcon = row.icon
                return (
                  <li key={row.label} className="contact__row">
                    <span className="contact__icon">
                      <RowIcon size={20} strokeWidth={1.6} />
                    </span>
                    <div>
                      <span className="contact__label">{row.label}</span>
                      {row.href ? (
                        <a href={row.href} className="contact__value contact__value--link">
                          {row.value}
                        </a>
                      ) : (
                        <span className="contact__value">{row.value}</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>

          <Reveal className="contact__note">
            <Info size={16} aria-hidden="true" />
            <p>{c.note}</p>
          </Reveal>
        </div>
      </section>
    </article>
  )
}
