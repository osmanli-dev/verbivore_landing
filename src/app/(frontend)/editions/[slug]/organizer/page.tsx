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
    title: `${base} - Organizer`,
    description: `Host institution and organizing partners of the ${base}.`,
    path: `/editions/${slug}/organizer`,
    image: (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? undefined,
  })
}

export default async function EditionOrganizerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) notFound()

  const hi = ed.hostInstitution || {}
  const ap = ed.academicPartner || {}
  const vp = ed.venuePartner || {}

  return (
    <>
      <section className="page-hero edition-hero" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff', paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/editions" style={{ color: 'rgba(255,255,255,.7)' }}>Editions</Link>
            <span>›</span>
            <Link href={`/editions/${slug}`} style={{ color: 'rgba(255,255,255,.7)' }}>{ed.shortTitle}</Link>
            <span>›</span>
            <span>Organizer</span>
          </div>
          <h1 style={{ color: '#fff' }}>{ed.shortTitle} Organizing Committee</h1>
          <p style={{ color: 'rgba(255,255,255,.84)' }}>Host institution, local organizing team and contact information for the {ed.shortTitle} Grand Final.</p>
          <EditionTabs slug={slug} active="organizer" />
        </div>
      </section>

      {/* ── HOST INSTITUTION + PARTNERS ───────────────────── */}
      {(hi.name || ap.name || vp.name) && (
        <section>
          <div className="container">
            <div className="two-col reveal" style={{ alignItems: 'stretch' }}>
              {/* Left: dark blue host panel */}
              <article className="panel desk-only" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
                <div style={{ display: 'inline-block', background: 'var(--orange)', color: '#fff', fontSize: 11, fontWeight: 800, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, marginBottom: 14 }}>
                  Official Host
                </div>
                <h2 style={{ color: '#fff', marginBottom: 10 }}>{hi.name || ed.organizer}</h2>
                {hi.description && <p style={{ color: 'rgba(255,255,255,.8)', lineHeight: 1.7, marginBottom: 18 }}>{hi.description}</p>}
                {hi.description2 && <p style={{ color: 'rgba(255,255,255,.7)', lineHeight: 1.7, marginBottom: 22, fontSize: 14 }}>{hi.description2}</p>}
                <div style={{ display: 'grid', gap: 10 }}>
                  {([['📍', hi.address], ['🌐', hi.website], ['📧', hi.email], ['📞', hi.phone]] as [string,string][]).filter(([,v]) => v).map(([icon, val]) => (
                    <div key={val} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{icon}</span>
                      <span style={{ color: 'rgba(255,255,255,.85)' }}>{val}</span>
                    </div>
                  ))}
                </div>
              </article>

              {/* Mobile: stacked host profile card */}
              <div className="mob-only mob-host-card">
                <div className="mob-host-badge">Official Host</div>
                <div className="mob-host-icon">🏛️</div>
                <h2>{hi.name || ed.organizer}</h2>
                {hi.description && <p>{hi.description}</p>}
                <div className="mob-contact-list" style={{ marginTop: 14 }}>
                  {([
                    ['📍', 'Address', hi.address, null],
                    ['🌐', 'Website', hi.website, hi.website ? (hi.website.startsWith('http') ? hi.website : `https://${hi.website}`) : null],
                    ['📧', 'Email',   hi.email,   hi.email ? `mailto:${hi.email}` : null],
                    ['📞', 'Phone',   hi.phone,   hi.phone ? `tel:${hi.phone.replace(/[^\d+]/g, '')}` : null],
                  ] as [string, string, string | undefined, string | null][]).filter(([, , v]) => v).map(([icon, label, val, href]) => (
                    href ? (
                      <a key={label} className="mob-contact-row on-dark" href={href} target={label === 'Website' ? '_blank' : undefined} rel={label === 'Website' ? 'noopener noreferrer' : undefined}>
                        <div className="mob-contact-icon">{icon}</div>
                        <div><div className="mob-contact-label">{label}</div><div className="mob-contact-value">{val}</div></div>
                      </a>
                    ) : (
                      <div key={label} className="mob-contact-row on-dark">
                        <div className="mob-contact-icon">{icon}</div>
                        <div><div className="mob-contact-label">{label}</div><div className="mob-contact-value">{val}</div></div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Right: academic + venue partner stacked */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {ap.name && (
                  <article className="panel reveal reveal-delay-1" style={{ background: 'linear-gradient(135deg,#fff7ed,#fff)' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🎓</div>
                    <h3 style={{ marginBottom: 8 }}>Academic Partner</h3>
                    <p style={{ color: 'var(--navy-2)', fontWeight: 800, marginBottom: 8 }}>{ap.name}</p>
                    {ap.description && <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>{ap.description}</p>}
                  </article>
                )}
                {vp.name && (
                  <article className="panel reveal reveal-delay-2" style={{ background: 'linear-gradient(135deg,#eef7ff,#fff)' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🏨</div>
                    <h3 style={{ marginBottom: 8 }}>Venue Partner</h3>
                    <p style={{ color: 'var(--navy-2)', fontWeight: 800, marginBottom: 8 }}>{vp.name}</p>
                    {vp.description && <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>{vp.description}</p>}
                  </article>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── LOCAL COMMITTEE ──────────────────────────────── */}
      {ed.committeeMembers && ed.committeeMembers.length > 0 && (
        <section className="section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Local committee</div>
                <h2 className="section-title reveal">The team behind the {ed.shortTitle} edition.</h2>
              </div>
              <p className="section-text reveal reveal-delay-1">These are the key members of the organizing committee responsible for delivering the {ed.shortTitle} Grand Final.</p>
            </div>
            <div className="member-grid">
              {ed.committeeMembers.map((m: any, i: number) => {
                const initials = (m.name as string).split(' ').map((p: string) => p[0]).join('').slice(0, 2)
                const GRAD_COLORS = [
                  'linear-gradient(135deg,var(--navy),var(--sky))',
                  'linear-gradient(135deg,#e36b1a,#f5a623)',
                  'linear-gradient(135deg,#1a7a3a,#2ca05a)',
                  'linear-gradient(135deg,#6b1a9a,#9a35cc)',
                  'linear-gradient(135deg,#1a5a8a,#2887cc)',
                  'linear-gradient(135deg,#8a3a1a,#cc5e2a)',
                  'linear-gradient(135deg,#1a7a6a,#2ca08a)',
                  'linear-gradient(135deg,#5a5a1a,#8a8a2a)',
                ]
                return (
                  <article key={i} className={`member-card reveal reveal-delay-${(i % 4) + 1}`}>
                    <div className="avatar" style={{ background: GRAD_COLORS[i % GRAD_COLORS.length] }}>{initials}</div>
                    <h3>{m.name}</h3>
                    <p>{m.role}</p>
                    {m.badge && <span className="status">{m.badge}</span>}
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── RESPONSIBILITIES + CONTACT ────────────────────── */}
      {(ed.organizerResponsibilities || (ed.contactBlocks && ed.contactBlocks.length > 0)) && (
        <section>
          <div className="container" style={{ paddingBottom: 72 }}>
            <div className="two-col">
              {ed.organizerResponsibilities && (
                <article className="panel reveal" style={{ background: 'linear-gradient(135deg,#fff7ed,#fff)' }}>
                  <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
                  <h3>Organizer Responsibilities</h3>
                  <ul style={{ color: 'var(--muted)', lineHeight: 1.8, paddingLeft: 18, marginTop: 12 }}>
                    {ed.organizerResponsibilities.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                      <li key={i}>{line.replace(/^•\s*/, '')}</li>
                    ))}
                  </ul>
                </article>
              )}
              {ed.contactBlocks && ed.contactBlocks.length > 0 && (
                <article className="panel reveal reveal-delay-1">
                  <div style={{ fontSize: 36, marginBottom: 14 }}>📞</div>
                  <h3>Contact the Organizer</h3>
                  <div className="desk-only desk-grid" style={{ gap: 12, marginTop: 12 }}>
                    {ed.contactBlocks.map((c: any, i: number) => (
                      <div key={i} style={{ padding: '12px 14px', background: '#f7f8ff', borderRadius: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{c.label}</div>
                        <div style={{ fontWeight: 800, color: 'var(--navy)', fontSize: 14 }}>{c.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mob-only mob-contact-list" style={{ marginTop: 12 }}>
                    {ed.contactBlocks.map((c: any, i: number) => {
                      const isEmail = /email/i.test(c.label) || c.value.includes('@')
                      const isPhone = !isEmail && (/phone|tel/i.test(c.label) || /^\+?[\d\s\-()]{6,}$/.test(c.value))
                      const href = isEmail ? `mailto:${c.value}` : isPhone ? `tel:${c.value.replace(/[^\d+]/g, '')}` : null
                      const icon = isEmail ? '📧' : isPhone ? '📞' : '✉️'
                      return href ? (
                        <a key={i} className="mob-contact-row" href={href}>
                          <div className="mob-contact-icon">{icon}</div>
                          <div><div className="mob-contact-label">{c.label}</div><div className="mob-contact-value">{c.value}</div></div>
                        </a>
                      ) : (
                        <div key={i} className="mob-contact-row">
                          <div className="mob-contact-icon">{icon}</div>
                          <div><div className="mob-contact-label">{c.label}</div><div className="mob-contact-value">{c.value}</div></div>
                        </div>
                      )
                    })}
                  </div>
                  <Link className="btn btn-primary btn-sm" href="/contact" style={{ marginTop: 16, display: 'inline-block' }}>Send a Message →</Link>
                </article>
              )}
            </div>
          </div>
        </section>
      )}

      {!hi.name && !ap.name && !vp.name && !ed.committeeMembers?.length && (
        <section>
          <div className="container" style={{ paddingBottom: 80, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>Organizer information will be published soon.</p>
          </div>
        </section>
      )}
    </>
  )
}
