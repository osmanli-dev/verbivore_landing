import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getCountries } from '@/lib/globals'
import WorldMapClient from '@/components/WorldMapClient'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Countries & Territories", description: "Participating countries and territories of the Verbivore English olympiad and accredited national representatives - find your country and how to register.", path: "/verbivore/countries-territories" })

function flagToCode(flag: string): string | null {
  if (!flag) return null
  const pts = [...flag].map(c => c.codePointAt(0) ?? 0)
  if (pts.length < 2 || pts[0] < 0x1F1E6 || pts[0] > 0x1F1FF) return null
  return pts.map(cp => String.fromCharCode(cp - 0x1F1E6 + 65)).join('').toLowerCase()
}

function FlagImg({ flag, name }: { flag: string; name: string }) {
  const code = flagToCode(flag)
  if (!code) return <span style={{ fontSize: 36 }}>{flag || '🌍'}</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt={name}
      width={48}
      height={32}
      style={{ objectFit: 'cover', borderRadius: 6, display: 'block' }}
      onError={undefined}
    />
  )
}

const STATUS_COLOR: Record<string, string> = {
  Active: 'var(--green)',
  Observer: 'var(--sky)',
  Pending: 'var(--orange)',
}

export default async function CountriesPage() {
  const docs = await getCountries()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>{' '}
            <Link href="/verbivore">Verbivore</Link> <span>›</span>{' '}
            <span>Countries &amp; Territories</span>
          </div>
          <h1>Countries &amp; Territories</h1>
          <p>
            Verbivore is coordinated through accredited national representatives across{' '}
            {docs.length}+ participating countries and territories.
          </p>
        </div>
      </section>

      {/* SEARCH */}
      <section style={{ padding: '36px 0 0' }}>
        <div className="container">
          <div className="participant-search-bar reveal" style={{ maxWidth: 480, margin: '0 auto' }}>
            <input
              type="text"
              id="countrySearch"
              placeholder="Find your country..."
              autoComplete="off"
              style={{
                width: '100%', padding: '14px 46px 14px 22px', borderRadius: 999,
                border: '1px solid var(--line)', background: '#fff',
                fontSize: 15, fontWeight: 700, color: 'var(--navy)', outline: 'none',
              }}
            />
            <span className="participant-search-icon">🔍</span>
          </div>
        </div>
      </section>

      {/* WORLD MAP — desktop only */}
      <section className="desk-only">
        <div className="container">
          <div className="section-head reveal" style={{ marginBottom: 22 }}>
            <div>
              <div className="kicker">Visual overview</div>
              <h2 className="section-title">Participating countries map.</h2>
            </div>
            <p className="section-text">
              Hover over a country to see details.
            </p>
          </div>

          <div className="map-interactive reveal">
            <div className="map-svg-area">
              <WorldMapClient countries={docs as any} />
            </div>

            <div className="map-legend">
              <div className="map-legend-item">
                <div className="map-legend-dot" style={{ background: 'var(--orange)' }} />
                Active Representative
              </div>
              <div className="map-legend-item">
                <div className="map-legend-dot" style={{ background: 'var(--sky)' }} />
                Observer
              </div>
              <div className="map-legend-item">
                <div className="map-legend-dot" style={{ background: 'var(--yellow)' }} />
                Representative Pending
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COUNTRY GRID — desktop */}
      <section className="section-soft desk-only">
        <div className="container">
          <div className="country-grid">
            {docs.map((c, i) => (
              <div
                key={c.id}
                className={`country-card reveal reveal-delay-${(i % 4) + 1}`}
                data-country-name={[c.name, c.accreditedOrganization, c.representative].filter(Boolean).join(' ').toLowerCase()}
              >
                <div className="flag"><FlagImg flag={c.flag} name={c.name} /></div>
                <h3>{c.name}</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: STATUS_COLOR[c.status] || 'var(--muted)',
                      display: 'inline-block',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 900,
                      fontSize: 12,
                      color: STATUS_COLOR[c.status] || 'var(--muted)',
                    }}
                  >
                    {c.status}
                  </span>
                </p>
                {c.accreditedOrganization && (
                  <p style={{ marginTop: 6, fontSize: 13, fontWeight: 800, color: 'var(--navy-2)' }}>{c.accreditedOrganization}</p>
                )}
                {c.representative && (
                  <p style={{ marginTop: 6, fontSize: 13 }}>{c.representative}</p>
                )}
                {(c as any).website && (
                  <a
                    href={(c as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginTop: 8, fontSize: 12, color: 'var(--sky)', fontWeight: 800, display: 'inline-block' }}
                  >
                    Visit website →
                  </a>
                )}
                {c.notes && <p style={{ marginTop: 6, fontSize: 13 }}>{c.notes}</p>}
              </div>
            ))}

            {/* "Your Country?" card */}
            <div
              className="country-card reveal"
              style={{
                background: 'linear-gradient(135deg,#fff7ed,#fffbf0)',
                border: '2px dashed var(--orange)',
              }}
            >
              <div className="flag">🌍</div>
              <h3>Your Country?</h3>
              <p style={{ color: 'var(--muted)', lineHeight: 1.5 }}>
                If your country is not listed, apply to become an accredited national
                representative.
              </p>
              <Link
                href="/contact"
                className="btn btn-primary"
                style={{ marginTop: 14, fontSize: 13, padding: '10px 16px' }}
              >
                Apply to represent →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* WORLD MAP — mobile */}
      <section className="mob-only" style={{ padding: '24px 0 0' }}>
        <div className="container">
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, color: 'var(--navy-2)', letterSpacing: '-.3px' }}>Participating countries map</h2>
          <p style={{ margin: '8px 0 16px', color: 'var(--muted)', fontSize: 14, lineHeight: 1.55 }}>
            Tap a highlighted country to see its representative.
          </p>

          <div className="mob-map-card">
            <div className="mob-map-svg-area">
              <WorldMapClient countries={docs as any} mobile />
            </div>
            <div className="mob-map-legend">
              <div className="mob-map-legend-item">
                <span className="mob-map-legend-dot" style={{ background: 'var(--orange)' }} />
                Active
              </div>
              <div className="mob-map-legend-item">
                <span className="mob-map-legend-dot" style={{ background: 'var(--sky)' }} />
                Observer
              </div>
              <div className="mob-map-legend-item">
                <span className="mob-map-legend-dot" style={{ background: 'var(--yellow)' }} />
                Pending
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE — flat contacts-style list */}
      <section className="mob-only" style={{ padding: '24px 0 48px' }}>
        <div className="container">
          {/* Status filter pills */}
          <div className="mob-country-filters">
            {(['All','Active','Observer','Pending'] as const).map(s => (
              <button key={s} className={`mob-filter-pill${s === 'All' ? ' active' : ''}`} data-country-filter={s}>{s}</button>
            ))}
          </div>

          <div className="mob-country-list" id="mobCountryList">
            {docs.map((c) => (
              <div
                key={c.id}
                className="mob-country-row"
                data-status={c.status}
                data-country-name={[c.name, c.accreditedOrganization, c.representative].filter(Boolean).join(' ').toLowerCase()}
              >
                <div className="mob-country-flag"><FlagImg flag={c.flag} name={c.name} /></div>
                <div className="mob-country-info">
                  <strong>{c.name}</strong>
                  {c.accreditedOrganization && <span>{c.accreditedOrganization}</span>}
                  {c.representative && <span>{c.representative}</span>}
                </div>
                <span className="mob-country-status" style={{ color: STATUS_COLOR[c.status] || 'var(--muted)', background: (STATUS_COLOR[c.status] || 'var(--muted)') + '18' }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>

          <div className="mob-country-cta">
            <div className="mob-country-cta-icon">🌍</div>
            <div>
              <strong>Your country not listed?</strong>
              <span>Apply to become a national representative.</span>
            </div>
            <Link href="/contact" className="btn btn-primary" style={{ flexShrink: 0, fontSize: 13 }}>Apply →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
