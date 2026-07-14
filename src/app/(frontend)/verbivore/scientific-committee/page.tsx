import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCommittee, getSiteSettings } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "International Scientific Committee", description: "Meet the international scientific committee behind Verbivore - the educators and linguists who design and review the contest materials.", path: "/verbivore/scientific-committee" })

export default async function CommitteePage() {
  const [docs, ss] = await Promise.all([getCommittee(), getSiteSettings()])
  if (ss.showScientificCommittee === false) notFound()

  const chairs = docs.filter((m) => m.isChair)
  const members = docs.filter((m) => !m.isChair)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> <span>›</span> <Link href="/verbivore">Verbivore</Link> <span>›</span> <span>Scientific Committee</span></div>
          <h1>International Scientific Committee</h1>
          <p>Our committee consists of leading educators, applied linguists and assessment specialists from partner countries who design and validate the Verbivore examination.</p>
        </div>
      </section>

      {/* ── DESKTOP grid ── */}
      <section className="desk-only">
        <div className="container">
          {chairs.length > 0 && (
            <div className="member-grid" style={{ marginBottom: 36 }}>
              {chairs.map((chair) => (
                <div key={chair.id} className="member-card reveal" style={{ border: '2px solid var(--orange)' }}>
                  <div className="avatar">
                    {chair.photo && typeof chair.photo === 'object' && (chair.photo as any).url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(chair.photo as any).url} alt={chair.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : chair.country?.flag || chair.name[0]}
                  </div>
                  <span className="status" style={{ display: 'block', marginBottom: 8 }}>Committee Chair</span>
                  <h3>{chair.name}</h3>
                  <p style={{ color: 'var(--orange)', fontWeight: 900 }}>{chair.title}</p>
                  {chair.organization && <p style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: 'var(--navy-2)' }}>{chair.organization}</p>}
                  {chair.country && <p style={{ marginTop: 6, fontSize: 13 }}>{chair.country.flag} {chair.country.name}</p>}
                  {chair.bio && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{chair.bio}</p>}
                </div>
              ))}
            </div>
          )}
          <h2 style={{ color: 'var(--navy-2)', marginBottom: 20, marginTop: 8 }}>Committee Members</h2>
          <div className="member-grid">
            {members.map((m, i) => (
              <div key={m.id} className={`member-card reveal reveal-delay-${(i % 4) + 1}`}>
                <div className="avatar">
                  {m.photo && typeof m.photo === 'object' && (m.photo as any).url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={(m.photo as any).url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  ) : m.country?.flag || m.name[0]}
                </div>
                <h3>{m.name}</h3>
                <p>{m.title}</p>
                {m.organization && <p style={{ marginTop: 4, fontSize: 13, fontWeight: 800, color: 'var(--navy-2)' }}>{m.organization}</p>}
                {m.country && <p style={{ marginTop: 6, fontSize: 13 }}>{m.country.flag} {m.country.name}</p>}
                {m.bio && <p style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{m.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MOBILE compact list ── */}
      <section className="mob-only" style={{ padding: '24px 0 48px' }}>
        <div className="container">
          {chairs.length > 0 && (
            <>
              <div className="mob-section-label">🏆 Committee Chair</div>
              {chairs.map((chair) => (
                <div key={chair.id} className="mob-member-card mob-member-chair">
                  <div className="mob-member-avatar">
                    {chair.photo && typeof chair.photo === 'object' && (chair.photo as any).url
                      ? <img src={(chair.photo as any).url} alt={chair.name} />
                      : <span>{chair.name[0]}</span>}
                  </div>
                  <div className="mob-member-info">
                    <strong>{chair.name}</strong>
                    <span style={{ color: 'var(--orange)' }}>{chair.title}</span>
                    {chair.organization && <em>{chair.organization}</em>}
                    {chair.country && <em>{chair.country.flag} {chair.country.name}</em>}
                    {chair.bio && <p>{chair.bio}</p>}
                  </div>
                </div>
              ))}
            </>
          )}
          <div className="mob-section-label" style={{ marginTop: 20 }}>👥 Committee Members</div>
          <div className="mob-member-list">
            {members.map((m) => (
              <div key={m.id} className="mob-member-card">
                <div className="mob-member-avatar">
                  {m.photo && typeof m.photo === 'object' && (m.photo as any).url
                    ? <img src={(m.photo as any).url} alt={m.name} />
                    : <span>{m.name[0]}</span>}
                </div>
                <div className="mob-member-info">
                  <strong>{m.name}</strong>
                  <span>{m.title}</span>
                  {m.organization && <em>{m.organization}</em>}
                  {m.country && <em>{m.country.flag} {m.country.name}</em>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
