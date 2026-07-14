import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEditionBySlug, editionHost } from '@/lib/globals'
import { EditionTabs } from '@/components/EditionTabs'
import { Icon, IconBadge } from '@/components/Icon'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) return {}
  const host = editionHost(ed)
  const base = [ed.year, host.name, 'Grand Final'].filter(Boolean).join(' ')
  return pageMetadata({
    title: `${base} - Schedule`,
    description: `Day-by-day schedule of the ${base}: ceremonies, exams, excursions and the awards night.`,
    path: `/editions/${slug}/schedule`,
    image: (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? undefined,
  })
}

const DAY_COLORS = [
  'linear-gradient(135deg,var(--navy),#222b72)',
  'linear-gradient(135deg,var(--orange),#e36b1a)',
  'linear-gradient(135deg,#e31a4a,#c0143d)',
  'linear-gradient(135deg,#1a7a3a,#2ca05a)',
  'linear-gradient(135deg,#555,#333)',
]
const DAY_EMOJIS = ['✈️', '🎫', '📝', '🏆', '🛫']

function DayIcon({ day, di, size, className, badge }: { day: any; di: number; size: number; className?: string; badge?: boolean }) {
  const color = day.color || '#333'
  const emoji = DAY_EMOJIS[di] ?? '📅'

  if (badge) {
    if (day.icon) return <IconBadge name={day.icon} color={color} size={size} className={className} />
    const dim = Math.round(size * 1.7)
    return (
      <div className={className} style={{ width: dim, height: dim, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: size, boxShadow: '0 4px 12px rgba(0,0,0,.12)' }}>
        {emoji}
      </div>
    )
  }

  if (day.icon) return <Icon name={day.icon} size={size} color={color} className={className} style={{ verticalAlign: 'middle' }} />
  return <span className={className}>{emoji}</span>
}

function dayGradient(day: any, di: number): string {
  if (day.color) {
    const hex = day.color.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    const shade = (v: number) => Math.round(v * 0.78).toString(16).padStart(2, '0')
    return `linear-gradient(135deg, ${day.color}, #${shade(r)}${shade(g)}${shade(b)})`
  }
  return DAY_COLORS[di] ?? DAY_COLORS[DAY_COLORS.length - 1]
}

export default async function EditionSchedulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) notFound()

  const days: any[] = ed.scheduleDays || []

  return (
    <>
      <section className="page-hero edition-hero" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff', paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/editions" style={{ color: 'rgba(255,255,255,.7)' }}>Editions</Link>
            <span>›</span>
            <Link href={`/editions/${slug}`} style={{ color: 'rgba(255,255,255,.7)' }}>{ed.shortTitle}</Link>
            <span>›</span>
            <span>Schedule</span>
          </div>
          <h1 style={{ color: '#fff' }}>{ed.shortTitle} Grand Final Schedule</h1>
          <p style={{ color: 'rgba(255,255,255,.84)' }}>Full day-by-day programme — arrival, ceremonies, contest, cultural activities and departures.</p>
          <EditionTabs slug={slug} active="schedule" />
        </div>
      </section>

      {days.length === 0 ? (
        <section>
          <div className="container" style={{ paddingBottom: 80, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>Schedule will be published soon.</p>
          </div>
        </section>
      ) : (
        <>
          {/* ── DATE OVERVIEW STRIP ──────────────────────── */}
          <section className="desk-only" style={{ background: 'var(--orange)', padding: 0 }}>
            <div className="schedule-date-strip container" style={{ display: 'flex', flexWrap: 'wrap', gap: 0, overflow: 'hidden' }}>
              {days.map((day: any, di: number) => {
                const isLast = di === days.length - 1
                const dateStr = day.dayLabel.split('—')[1]?.trim() || day.dayLabel
                return (
                  <div key={di} className="schedule-date-cell" style={{ flex: 1, minWidth: 140, padding: '18px 20px', borderRight: isLast ? 'none' : '1px solid rgba(255,255,255,.2)', textAlign: 'center' }}>
                    <div style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>
                      {day.dayTitle || day.dayLabel.split('—')[0]?.trim() || `Day ${di}`}
                    </div>
                    <div style={{ color: '#fff', fontSize: 20, fontWeight: 900 }}>{dateStr}</div>
                  </div>
                )
              })}
            </div>
          </section>

          {/* ── MOBILE DAY SWITCHER ──────────────────────── */}
          <section className="mob-only" style={{ paddingBottom: 0 }}>
            <div className="container">
              <div className="mob-pill-tabs">
                {days.map((day: any, di: number) => (
                  <button key={di} className={`mob-pill-tab${di === 0 ? ' active' : ''}`} data-cat={di}>
                    <DayIcon day={day} di={di} size={14} /> Day {di}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* ── FULL SCHEDULE ────────────────────────────── */}
          <section>
            <div className="container" style={{ paddingBottom: 72 }}>
              <div className="section-head desk-only" style={{ marginBottom: 32 }}>
                <div>
                  <div className="kicker">Full programme</div>
                  <h2 className="section-title reveal">Five days of contest, culture and connection.</h2>
                </div>
                <p className="section-text reveal reveal-delay-1">Times are indicative and may be adjusted. All registered participants will receive the final schedule before arrival.</p>
              </div>

              <div className="schedule reveal desk-only">
                {days.map((day: any, di: number) => (
                  <div key={di} className="schedule-item">
                    <div className="schedule-date" style={{ background: dayGradient(day, di), color: '#fff', borderRadius: 10, padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><DayIcon day={day} di={di} size={24} badge /></div>
                      <div style={{ fontWeight: 900, fontSize: 15 }}>Day {di}</div>
                      <div style={{ fontSize: 12, opacity: .75 }}>{day.dayLabel.split('—')[1]?.trim() ?? ''}</div>
                    </div>
                    <div className="schedule-content">
                      <h3>{day.dayTitle || day.dayLabel}</h3>
                      {day.dayNote && <p style={{ color: 'var(--muted)', marginBottom: 14 }}>{day.dayNote}</p>}
                      {day.items && day.items.length > 0 && (
                        <div className="table-scroll"><table style={{ fontSize: 14, width: '100%', minWidth: 480 }}>
                          <thead>
                            <tr>
                              {['Time', 'Activity', 'Note'].map(h => (
                                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', background: 'var(--soft,#f7f8ff)' }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {day.items.map((item: any, ii: number) => (
                              <tr key={ii} style={item.highlight ? { background: '#fff0f0' } : {}}>
                                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontWeight: item.highlight ? 700 : undefined }}>{item.time}</td>
                                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', fontWeight: item.highlight ? 700 : undefined }}>{item.activity}</td>
                                <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{item.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── MOBILE: per-day timeline cards ──────────── */}
              <div className="mob-only">
                {days.map((day: any, di: number) => (
                  <div key={di} className={`mob-pill-panel${di === 0 ? ' active' : ''}`} data-panel={di}>
                    <div className="mob-day-head" style={{ background: dayGradient(day, di) }}>
                      <DayIcon day={day} di={di} size={24} badge />
                      <div>
                        <strong>{day.dayTitle || day.dayLabel}</strong>
                        {day.dayNote && <span>{day.dayNote}</span>}
                      </div>
                    </div>
                    {day.items && day.items.length > 0 && (
                      <div className="mob-timeline-card">
                        {day.items.map((item: any, ii: number) => (
                          <div key={ii} className={`mob-timeline-row${item.highlight ? ' highlight' : ''}`}>
                            <div className="mob-timeline-time">{item.time}</div>
                            <div className="mob-timeline-body">
                              <strong>{item.activity}</strong>
                              {item.note && <span>{item.note}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Notes + Download */}
              <div className="two-col" style={{ gap: 24, marginTop: 32 }}>
                {ed.scheduleNotes && (
                  <div className="panel">
                    <h3 style={{ marginBottom: 14 }}>📌 Important Notes</h3>
                    <ul style={{ paddingLeft: 18, color: 'var(--muted)', lineHeight: 1.75, fontSize: 14 }}>
                      {ed.scheduleNotes.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                        <li key={i}>{line.replace(/^•\s*/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="panel">
                  <h3 style={{ marginBottom: 14 }}>📄 Programme PDF</h3>
                  {ed.schedulePdfUrl ? (
                    <a className="btn btn-primary btn-sm" href={ed.schedulePdfUrl} target="_blank" rel="noopener noreferrer">Download Programme PDF →</a>
                  ) : (
                    <p style={{ color: 'var(--muted)', fontSize: 14 }}>PDF will be available closer to the event.</p>
                  )}
                  <div style={{ marginTop: 16 }}>
                    <Link href={`/editions/${slug}/organizer`} style={{ fontSize: 14, fontWeight: 800, color: 'var(--orange)' }}>Contact Organizer →</Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </>
  )
}
