import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEditionBySlug, editionHost } from '@/lib/globals'
import { EditionTabs } from '@/components/EditionTabs'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) return {}
  const host = editionHost(ed)
  const base = [ed.year, host.name, 'Grand Final'].filter(Boolean).join(' ')
  return pageMetadata({
    title: `${base}`,
    description: ed.description || `The ${base} - an international week of academic excellence and friendship.`,
    path: `/editions/${slug}`,
    image: (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? undefined,
  })
}

export default async function EditionAboutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) notFound()

  const heroImg = (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? null
  const host = editionHost(ed)

  return (
    <>
      {/* ── HERO + TABS ─────────────────────────────────── */}
      <section className="page-hero edition-hero" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff', paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/editions" style={{ color: 'rgba(255,255,255,.7)' }}>Editions</Link>
            <span>›</span>
            <span>2026 UK Edition</span>
          </div>
          <h1 style={{ color: '#fff' }}>{ed.year ? `${ed.year} ${host.name || ''} Grand Final` : ed.shortTitle}</h1>
          <p style={{ color: 'rgba(255,255,255,.84)' }}>{ed.description || 'The Verbivore Grand Final — an unforgettable week of academic excellence and international friendship.'}</p>
          <EditionTabs slug={slug} active="about" />
        </div>
      </section>

      {/* ── MOBILE QUICK LINKS ───────────────────────────── */}
      <section className="mob-only" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="mob-quicklink-grid">
            {[
              { icon: '🏅', title: 'Results',      href: '/editions/results' },
              { icon: '🗓️', title: 'Schedule',      href: `/editions/${slug}/schedule` },
              { icon: '📘', title: 'Rules',         href: `/editions/${slug}/rules` },
              { icon: '🌍', title: 'Participants',  href: `/editions/${slug}/participants` },
              { icon: '👥', title: 'Organizer',     href: `/editions/${slug}/organizer` },
            ].map((card) => (
              <Link key={card.title} href={card.href} className="mob-quicklink-tile">
                <div className="mob-quicklink-icon">{card.icon}</div>
                <div className="mob-quicklink-title">{card.title}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRAVEL HERO ──────────────────────────────────── */}
      <section>
        <div className="container">
          <div className="travel-hero reveal" style={heroImg ? ({ '--bg': `url('${heroImg}')` } as React.CSSProperties) : {}}>
            <div className="travel-hero-overlay" />
            <div className="travel-hero-content">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {host.flag && <span className="pill">{host.flag} {host.name}</span>}
                {ed.dates && <span className="pill">{ed.dates}</span>}
                <span className="pill">Grand Final</span>
              </div>
              <h2>{ed.aboutTitle || `Welcome to ${host.name || 'the host country'}`}</h2>
              {ed.aboutText && <p>{ed.aboutText}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ── DESTINATION CARDS ────────────────────────────── */}
      {ed.destinationCards && ed.destinationCards.length > 0 && (
        <section className="section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Destination guide</div>
                <h2 className="section-title reveal">Everything about the host city.</h2>
              </div>
              <p className="section-text reveal reveal-delay-1">From accommodation to cuisine and cultural visits — all the practical information participants and families need before arriving.</p>
            </div>
            <div className="travel-grid">
              {ed.destinationCards.map((card: any, i: number) => (
                <div key={i} className={`travel-card reveal reveal-delay-${(i % 3) + 1}`}>
                  <div className="travel-cover" style={card.imageUrl ? ({ '--bg': `url('${card.imageUrl}')` } as React.CSSProperties) : {}} />
                  <div className="travel-body">
                    {card.icon && <span className="travel-emoji">{card.icon}</span>}
                    <h4>{card.title}</h4>
                    <p>{card.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TWO-COL: KEY FACTS + QUICK LINKS ─────────────── */}
      <section>
        <div className="container" style={{ paddingBottom: 72 }}>
          <div className="two-col">
            <article className="panel reveal">
              <h3>Grand Final information</h3>
              <p>{ed.description || `The ${ed.year || ''} ${host.name || ''} Grand Final brings together qualified students from 35+ countries.`}</p>
              <div className="desk-only desk-grid" style={{ gap: 9, marginTop: 16 }}>
                {[
                  ['Location',     [ed.hostCity, host.name].filter(Boolean).join(', ')],
                  ['Dates',        ed.dates],
                  ['Duration',     ed.duration],
                  ['Participants', ed.participantsCount ? `${ed.participantsCount} countries` : null],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={String(k)} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: '#f7f8ff', borderRadius: 14 }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 850 }}>{k}</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 950 }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="mob-only mob-stat-strip" style={{ marginTop: 16 }}>
                {[
                  ['📍', 'Location',     [ed.hostCity, host.name].filter(Boolean).join(', ')],
                  ['📅', 'Dates',        ed.dates],
                  ['⏱️', 'Duration',     ed.duration],
                  ['🌍', 'Participants', ed.participantsCount ? `${ed.participantsCount} countries` : null],
                ].filter(([, , v]) => v).map(([icon, k, v]) => (
                  <div key={String(k)} className="mob-stat-pill wide">
                    <div className="mob-stat-pill-icon">{icon}</div>
                    <b>{v}</b>
                    <span>{k}</span>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel reveal reveal-delay-1">
              <h3>Explore the full edition</h3>
              <p>Navigate through the complete {ed.shortTitle} edition using the tabs above — or use the links below to jump directly.</p>
              <div style={{ display: 'grid', gap: 9, marginTop: 16 }}>
                {[
                  { key: 'organizer',    label: 'Host organization & team →' },
                  { key: 'schedule',     label: 'Day-by-day schedule →' },
                  { key: 'rules',        label: 'Contest rules & documents →' },
                  { key: 'participants', label: 'Country delegations →' },
                  { key: 'results',      label: 'Results & medal table →' },
                ].map(({ key, label }) => (
                  <Link
                    key={key}
                    href={key === 'results' ? '/editions/results' : `/editions/${slug}/${key}`}
                    className="card-link"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>
    </>
  )
}
