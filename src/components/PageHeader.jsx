export default function PageHeader({ kicker, title, lead }) {
  return (
    <header className="page-header">
      <div className="container page-header__inner">
        {kicker && <p className="page-header__kicker">{kicker}</p>}
        <h1 className="page-header__title">{title}</h1>
        {lead && <p className="page-header__lead">{lead}</p>}
        <div className="page-header__rule" aria-hidden="true">
          <span />
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M12 2v20M2 12h20" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3.4" />
          </svg>
          <span />
        </div>
      </div>
    </header>
  )
}
