import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getEditions, getEditionsPage, getCountries, editionHost } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Editions", description: "Every year a new host country. Explore Verbivore Grand Final editions: hosts, participants, schedules and results.", path: "/editions" })

export default async function EditionsPage() {
  const [ep, editions, countries] = await Promise.all([getEditionsPage(), getEditions(), getCountries()])

  const featured = editions.find((e: any) => e.status === 'current') ?? editions[0] ?? null
  const featuredImg = featured ? ((featured.image as any)?.url ?? (featured.heroImage as any)?.url ?? null) : null
  const featuredHost = editionHost(featured)
  const heroFlags = countries.map((c: any) => c.flag).filter(Boolean).slice(0, 6)

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="page-hero editions-hero" style={{ background: 'linear-gradient(135deg,#11185a 0%,#1c2c72 55%,#2d1b8a 100%)', color: '#fff' }}>
        <div className="eh-flags desk-only" aria-hidden="true">
          {heroFlags.map((flag: string, i: number) => (
            <span key={i} className={`eh-flag eh-flag-${i + 1}`}>{flag}</span>
          ))}
        </div>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.7)' }}>Home</Link>
            <span>›</span>
            <span>Editions</span>
          </div>
          <div className="eyebrow"><span></span> Global Competition</div>
          <h1 style={{ color: '#fff' }}>{ep.heroTitle || 'Grand Final Editions'}</h1>
          <p style={{ color: 'rgba(255,255,255,.84)', maxWidth: 600 }}>{ep.heroSubtitle || 'Each Verbivore Grand Final is hosted in a different country — a full week of academic excellence, cultural discovery and international friendship.'}</p>
          <div className="eh-stats">
            {[
              [ep.statsEditions || '3',    'Editions hosted'],
              [ep.statsCountries || '35+', 'Countries in 2026'],
              [ep.statsAlumni || '500+',   'Grand Final alumni'],
            ].map(([n, label]) => (
              <div className="eh-stat" key={String(label)}>
                <b>{n}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED EDITION — desktop ─────────────────────── */}
      {featured && featured.slug && (
        <section className="desk-only">
          <div className="container">
            <div className="kicker reveal" style={{ marginBottom: 8 }}>Current edition</div>
            <div className="panel reveal" style={{ padding: 0, overflow: 'hidden', border: '2px solid var(--orange)' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: 320 }}>
                <div style={{
                  flex: '1 1 340px', minHeight: 240, position: 'relative',
                  background: featuredImg
                    ? `url('${featuredImg}') center/cover no-repeat`
                    : 'linear-gradient(135deg,#17205a,#2b3585)',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right,rgba(23,32,90,.72),transparent)' }} />
                  <div style={{ position: 'absolute', top: 20, left: 20, background: 'var(--orange)', color: '#fff', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.08em', padding: '6px 16px', borderRadius: 20 }}>
                    🔴 Live Edition
                  </div>
                </div>
                <div style={{ flex: '1 1 300px', padding: '38px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--orange)', marginBottom: 6 }}>
                      {featured.year || ''} Grand Final
                    </div>
                    <h2 style={{ color: 'var(--navy)', fontSize: 28, margin: '0 0 10px' }}>
                      {featuredHost.flag && <span style={{ marginRight: 8 }}>{featuredHost.flag}</span>}
                      {featuredHost.name || featured.shortTitle}
                    </h2>
                    {featured.description && (
                      <p style={{ color: 'var(--muted)', lineHeight: 1.7 }}>{featured.description}</p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {featured.dates && <span style={{ background: '#eef7ff', color: 'var(--navy)', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>📅 {featured.dates}</span>}
                    {featured.hostCity && <span style={{ background: '#fff7ed', color: '#c45f00', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>📍 {featured.hostCity}</span>}
                    {featured.participantsCount && <span style={{ background: '#f0fff4', color: '#1a6b3a', padding: '5px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>👥 {featured.participantsCount} countries</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
                    <Link className="btn btn-primary" href={`/editions/${featured.slug}`}>Open Edition →</Link>
                    <Link className="btn btn-ghost" href="/editions/results">View Results</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── ALL EDITIONS GRID — desktop ─────────────────────── */}
      <section className="section-soft desk-only">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="kicker">All editions</div>
              <h2 className="section-title reveal">Every Grand Final, one city at a time.</h2>
            </div>
            <p className="section-text reveal reveal-delay-1">Verbivore travels to a different host country each year, giving students a unique international experience alongside world-class academic competition.</p>
          </div>
          {editions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>No editions yet.</div>
          ) : (
            <div className="edition-grid">
              {editions.map((ed: any, i: number) => {
                const img = (ed.image as any)?.url ?? (ed.heroImage as any)?.url ?? null
                const isCurrent = ed.status === 'current'
                const isUpcoming = ed.status === 'upcoming'
                const badgeLabel = isCurrent ? 'Current' : isUpcoming ? 'Upcoming' : 'Archive'
                const badgeStyle = isCurrent ? { background: 'var(--orange)', color: '#fff' } : { background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.3)', backdropFilter: 'blur(4px)' }
                return (
                  <article key={ed.id} className={`edition-card reveal reveal-delay-${(i % 3) + 1}`}>
                    <div className="edition-cover" style={img ? ({ '--bg': `url('${img}')` } as React.CSSProperties) : {}}>
                      <span style={{ position: 'absolute', top: 14, right: 14, fontSize: 11, fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '.06em', padding: '5px 12px', borderRadius: 20, ...badgeStyle }}>{badgeLabel}</span>
                    </div>
                    <div className="edition-body">
                      <h3>{ed.flag && <span style={{ marginRight: 6 }}>{ed.flag}</span>}{ed.shortTitle}</h3>
                      {ed.description && <p>{ed.description}</p>}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '12px 0', fontSize: 13, color: 'var(--muted)' }}>
                        {ed.dates && <span>📅 {ed.dates}</span>}
                        {ed.organizer && <span>🎓 {ed.organizer}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ed.slug && ed.status !== 'upcoming' ? <Link className="btn btn-primary" href={`/editions/${ed.slug}`}>Open →</Link> : <Link className="btn btn-ghost" href="/contact">Coming soon</Link>}
                        {ed.status !== 'upcoming' && <Link className="btn btn-ghost" href="/editions/results">Results</Link>}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── MOBILE: editions stack cards ─────────────────── */}
      <section className="mob-only" style={{ padding: '20px 0 40px' }}>
        <div className="container">
          <div className="kicker" style={{ marginBottom: 16 }}>All Editions</div>
          <div className="mob-editions-list">
            {editions.map((ed: any) => {
              const img = (ed.image as any)?.url ?? (ed.heroImage as any)?.url ?? null
              const isCurrent = ed.status === 'current'
              return (
                <article key={ed.id} className={`mob-edition-card${isCurrent ? ' mob-edition-current' : ''}`}>
                  <div className="mob-edition-cover" style={img ? ({ '--bg': `url('${img}')` } as React.CSSProperties) : {}}>
                    <div className="mob-edition-cover-overlay" />
                    <div className="mob-edition-cover-content">
                      <span className="mob-edition-badge" style={isCurrent ? { background: 'var(--orange)', color: '#fff' } : { background: 'rgba(255,255,255,.18)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' }}>
                        {isCurrent ? '🔴 Live' : ed.status === 'upcoming' ? 'Upcoming' : 'Archive'}
                      </span>
                      <h3 className="mob-edition-title">{ed.flag} {ed.shortTitle}</h3>
                      {ed.dates && <span className="mob-edition-dates">📅 {ed.dates}</span>}
                    </div>
                  </div>
                  {(ed.description || ed.slug) && (
                    <div className="mob-edition-body">
                      {ed.description && <p>{ed.description}</p>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {ed.slug && ed.status !== 'upcoming' ? <Link className="btn btn-primary btn-sm" href={`/editions/${ed.slug}`}>Open →</Link> : <span className="btn btn-ghost btn-sm">Coming soon</span>}
                        {ed.status !== 'upcoming' && <Link className="btn btn-ghost btn-sm" href="/editions/results">Results</Link>}
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW HOST COUNTRIES ARE SELECTED ──────────────── */}
      <section>
        <div className="container">
          <div className="section-head" style={{ marginBottom: 40 }}>
            <div>
              <div className="kicker">Hosting a Grand Final</div>
              <h2 className="section-title">How host countries are selected.</h2>
            </div>
            <p className="section-text">National representatives can express interest in hosting a future Grand Final by submitting a bid.</p>
          </div>
          <div className="round-grid">
            {[
              { n: '01', title: 'Submit a Bid', text: 'National representatives submit a bid including venue, logistics, cultural programme and budget details.' },
              { n: '02', title: 'Review & Shortlist', text: '2–3 candidates are shortlisted, followed by an assessment visit and Q&A with the coordination team.' },
              { n: '03', title: 'Official Announcement', text: 'The host country is announced at the current year\'s closing ceremony and on verbivore.org.' },
            ].map((step, i) => (
              <article key={step.n} className={`round-card reveal reveal-delay-${i + 1}`}>
                <div className="round-number">{step.n}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <Link className="btn btn-primary" href="/contact">Enquire About Hosting →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
