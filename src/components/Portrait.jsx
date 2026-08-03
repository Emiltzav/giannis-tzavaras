import { useLang } from '../i18n/LanguageContext.jsx'

/*
 * Portrait of Giannis Tzavaras.
 * Real photographs live in /public/images. Pass `src` to choose which one;
 * defaults to the recent (Professor Emeritus) photograph.
 * Paths are relative (no leading slash) so the built site also works when
 * opened directly from the filesystem (file://) - see vite.config base.
 */
export default function Portrait({
  src = 'images/IoannisTzavaras.jpg',
  caption,
  showCaption = true,
}) {
  const { t } = useLang()

  return (
    <figure className="portrait portrait--photo" aria-label={t.meta.name}>
      <img src={src} alt={t.meta.name} loading="lazy" />
      <div className="portrait__frame" aria-hidden="true" />
      {showCaption && <figcaption className="portrait__tag">{caption || t.meta.name}</figcaption>}
    </figure>
  )
}
