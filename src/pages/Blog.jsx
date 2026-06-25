import { Link } from 'react-router-dom'
import { ArrowUpRight, Clock } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext.jsx'
import PageHeader from '../components/PageHeader.jsx'
import Reveal from '../components/Reveal.jsx'
import { readingTime, formatDate } from '../utils/format.js'

export default function Blog() {
  const { t, lang } = useLang()
  const blog = t.blog

  return (
    <article className="page">
      <PageHeader kicker={t.nav.blog} title={blog.title} lead={blog.lead} />

      <section className="section">
        <div className="container">
          <div className="blog-list">
            {blog.posts.map((post, i) => (
              <Reveal key={post.id} delay={i * 70}>
                <Link to={`/blog/${post.id}`} className="blog-list__item">
                  <div className="blog-list__meta">
                    <time>{formatDate(post.date, lang)}</time>
                    <span className="blog-list__reading">
                      <Clock size={13} /> {readingTime(post.body)} {readingTime(post.body) === 1 ? t.ui.minReadOne : t.ui.minRead}
                    </span>
                  </div>
                  <h2 className="blog-list__title">{post.title}</h2>
                  <p className="blog-list__excerpt">{post.excerpt}</p>
                  <div className="blog-list__footer">
                    <ul className="tags">
                      {post.tags.map((tag) => (
                        <li key={tag} className="tag">#{tag}</li>
                      ))}
                    </ul>
                    <span className="link-arrow">
                      {t.ui.readMore} <ArrowUpRight size={16} />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </article>
  )
}
