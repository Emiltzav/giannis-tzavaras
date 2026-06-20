import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { readingTime, formatDate } from '../utils/format.js'

export default function BlogPost() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const post = t.blog.posts.find((p) => p.id === id)

  if (!post) {
    return (
      <div className="page">
        <div className="container narrow empty-state">
          <h1>404</h1>
          <Link to="/blog" className="btn btn--ghost">
            <ArrowLeft size={18} /> {t.ui.backToBlog}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <article className="page post">
      <div className="post__hero">
        <div className="container narrow">
          <Link to="/blog" className="post__back">
            <ArrowLeft size={16} /> {t.ui.backToBlog}
          </Link>
          <div className="post__meta">
            <time>{formatDate(post.date, lang)}</time>
            <span className="post__reading">
              <Clock size={14} /> {readingTime(post.body)} {t.ui.minRead}
            </span>
          </div>
          <h1 className="post__title">{post.title}</h1>
          <ul className="tags">
            {post.tags.map((tag) => (
              <li key={tag} className="tag">#{tag}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="container narrow post__body">
        <p className="post__lead">{post.excerpt}</p>
        {post.body.map((para, i) => (
          <Reveal as="p" key={i} delay={i * 40} className="prose-p">
            {para}
          </Reveal>
        ))}

        <div className="post__signature">
          <img src="/owl.svg" alt="" aria-hidden="true" width="34" height="34" />
          <span>{t.meta.name}</span>
        </div>

        <Link to="/blog" className="btn btn--ghost post__bottom-back">
          <ArrowLeft size={18} /> {t.ui.backToBlog}
        </Link>
      </div>
    </article>
  )
}
