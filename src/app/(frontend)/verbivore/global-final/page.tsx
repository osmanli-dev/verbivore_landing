import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getEditions, editionHost } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Grand Final", description: "The Verbivore Grand Final - the international culmination where national champions from 35+ countries compete for the world title.", path: "/verbivore/global-final" })

// ── Phase resolution ──────────────────────────────────────────────────────────
function resolvePhase(edition: any): 1 | 2 | 3 | 4 {
  if (!edition) return 1
  const hasMedals = (edition.medalTable ?? []).length > 0
  if (hasMedals || edition.status === 'past') return 4
  if (edition.status === 'current')           return 3
  return 2
}

const PHASES = [
  { n: 1 as const, title: 'National Finals',   note: 'Country qualifying round closed' },
  { n: 2 as const, title: 'Registration',      note: 'Delegations confirmed & registered' },
  { n: 3 as const, title: 'Grand Final Exam',  note: 'Exam day — London, July 15 2026' },
  { n: 4 as const, title: 'Results & Awards',  note: 'Medal ceremony & champion revealed' },
]

const SCHEDULE = [
  { date: 'Jul 14', title: 'Arrival & Welcome Reception', desc: 'Airport transfers, registration, welcome dinner and opening ceremony at Royal Lancaster Hall.' },
  { date: 'Jul 15', title: 'Grand Final Exam',            desc: 'All 4 categories (Junior A, Junior B, Intermediate, Senior) sit their paper exam simultaneously.' },
  { date: 'Jul 16', title: 'Cultural Programme',          desc: 'Guided city tour, team activities, farewell dinner and gala evening.' },
  { date: 'Jul 17', title: 'Results & Awards Ceremony',   desc: 'Official medal presentation and Grand Champion announcement. Open to invited guests.' },
  { date: 'Jul 18', title: 'Departure',                   desc: 'Farewell breakfast and coordinated group transfers to Heathrow and Gatwick.' },
]

const GF_CATEGORIES = [
  { cat: 'Junior A',     grade: 'Grade 1–4', icon: '🌱' },
  { cat: 'Junior B',     grade: 'Grade 5–7', icon: '📗' },
  { cat: 'Intermediate', grade: 'Grade 8–9', icon: '📘' },
  { cat: 'Senior',       grade: 'Grade 10–11', icon: '🎓' },
]

export default async function GlobalFinalPage() {
  const editions   = await getEditions()
  const edition    = editions.find((e: any) => e.status === 'current') ?? editions[0] ?? null
  const host       = editionHost(edition)
  const phase      = resolvePhase(edition)
  const hasMedals  = (edition?.medalTable ?? []).length > 0
  const medalTable: any[]   = hasMedals ? [...(edition.medalTable ?? [])].sort(
    (a: any, b: any) => (b.gold - a.gold) || (b.silver - a.silver) || (b.bronze - a.bronze)
  ) : []
  const champion = medalTable[0] ?? null

  const statusLabel = edition?.status === 'current'  ? 'LIVE EDITION'
                    : edition?.status === 'upcoming' ? 'UPCOMING'
                    : 'COMPLETED'
  const statusColor = edition?.status === 'current'  ? 'var(--orange)'
                    : edition?.status === 'upcoming' ? 'var(--sky)'
                    : 'var(--green)'

  return (
    <>
      {/* ── HERO ── */}
      <section className="gf-hero">
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.5)' }}>
            <Link href="/" style={{ color: 'rgba(255,255,255,.5)' }}>Home</Link> <span>›</span>
            <Link href="/verbivore" style={{ color: 'rgba(255,255,255,.5)' }}>Verbivore</Link> <span>›</span>
            <span>Grand Final</span>
          </div>

          <div className="gf-hero-body">
            <div className="gf-hero-left">
              <div className="gf-hero-meta">
                <span className="gf-flag">{edition?.flag ?? '🏆'}</span>
                <span className="gf-status-badge" style={{ background: statusColor }}>{statusLabel}</span>
              </div>
              <h1 className="gf-hero-title">Grand Final {edition?.year ?? 2026}</h1>
              <p className="gf-hero-sub">
                {edition?.hostCity && `${edition.hostCity}, `}{host.name || 'London, United Kingdom'}
                {edition?.dates    && ` · ${edition.dates}`}
                {edition?.organizer && ` · ${edition.organizer}`}
              </p>
              <div className="gf-hero-btns">
                {hasMedals
                  ? <Link className="btn btn-primary" href="/editions/results">View Results →</Link>
                  : <a className="btn btn-outline gf-btn-ghost" href="#programme">View Programme</a>
                }
                <Link className="btn btn-outline gf-btn-ghost" href="/editions">All Editions</Link>
              </div>

              {/* Mobile: trophy stats as scroll-snap pill strip */}
              <div className="mob-only mob-stat-strip" style={{ marginTop: 22 }}>
                <div className="mob-stat-pill">
                  <span className="mob-stat-pill-icon">🌍</span>
                  <b>35+</b>
                  <span>Countries</span>
                </div>
                <div className="mob-stat-pill">
                  <span className="mob-stat-pill-icon">🎓</span>
                  <b>500+</b>
                  <span>Students</span>
                </div>
                <div className="mob-stat-pill">
                  <span className="mob-stat-pill-icon">🧩</span>
                  <b>4</b>
                  <span>Categories</span>
                </div>
              </div>
            </div>

            {/* Trophy / stats box */}
            <div className="gf-hero-trophy desk-only">
              <div className="gf-trophy-icon">🏆</div>
              <div className="gf-trophy-stats">
                <div className="gf-trophy-stat"><b>35+</b><span>Countries</span></div>
                <div className="gf-trophy-stat"><b>500+</b><span>Students</span></div>
                <div className="gf-trophy-stat"><b>4</b><span>Categories</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHASE STRIP ── */}
      <div className="gf-phase-wrap desk-only">
        <div className="container">
          <div className="gf-phase-strip">
            {PHASES.map((p, i) => {
              const isDone   = p.n < phase
              const isActive = p.n === phase
              return (
                <div key={p.n} className={`gf-phase-step${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
                  {i > 0 && <div className={`gf-phase-line${isDone || isActive ? ' filled' : ''}`} />}
                  <div className="gf-phase-circle">
                    {isDone ? '✓' : p.n}
                  </div>
                  <div className="gf-phase-info">
                    <strong>{p.title}</strong>
                    <span>{p.note}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MOBILE: PHASE STEPPER ── */}
      <div className="mob-only" style={{ padding: '20px 0 0' }}>
        <div className="container">
          <div className="mob-stepper">
            {PHASES.map((p) => {
              const isDone   = p.n < phase
              const isActive = p.n === phase
              return (
                <div key={p.n} className="mob-stepper-item">
                  <div className={`mob-stepper-node${isDone ? ' done' : ''}${isActive ? ' active' : ''}`}>
                    {isDone ? '✓' : p.n}
                  </div>
                  <div className="mob-stepper-body">
                    <strong>{p.title}</strong>
                    <p style={{ marginBottom: 0 }}>{p.note}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── RESULTS (phase 4 only) ── */}
      {phase >= 4 && (
        <section id="results" className="section-soft" style={{ scrollMarginTop: 80 }}>
          <div className="container">
            <div className="section-head reveal">
              <div>
                <div className="kicker">Grand Final {edition?.year ?? 2026} · London</div>
                <h2 className="section-title">Medal Table</h2>
              </div>
              <p className="section-text">Official results — sorted by gold, silver, bronze count.</p>
            </div>

            {hasMedals ? (
              <div className="panel reveal" style={{ textAlign: 'center', padding: '44px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🏆</div>
                <h3 style={{ marginBottom: 8 }}>
                  Champion: {champion?.country?.flag} {champion?.country?.name}
                </h3>
                <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
                  The {edition?.year ?? 2026} Grand Final medal table and full student results are now available.
                </p>
                <Link className="btn btn-primary" href="/editions/results">Full Medal Table & Student Results →</Link>
              </div>
            ) : (
              /* Phase 4 but no data yet */
              <div className="gf-results-placeholder reveal">
                <div className="gf-results-ph-icon">⏳</div>
                <h3>Results Are Being Processed</h3>
                <p>The Grand Final exam has concluded. Official results and the medal table will be published here as soon as the marking is complete and verified by the international committee.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── COMING SOON (phase < 4) ── */}
      {phase < 4 && (
        <section className="section-soft">
          <div className="container">
            <div className="gf-results-upcoming reveal">
              <div className="gf-ru-left">
                <div className="gf-ru-icon">🏅</div>
                <div>
                  <h3>Results — Not Yet Available</h3>
                  <p>Medal table and individual results will appear here automatically once the Grand Final exam is complete and all papers are marked. Check back after July 17, 2026.</p>
                </div>
              </div>
              <div className="gf-ru-phase">
                Currently in <strong>Phase {phase}</strong>:<br />
                <span>{PHASES[phase - 1].title}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── PROGRAMME & EVENT DETAILS ── */}
      <section id="programme" style={{ scrollMarginTop: 80 }}>
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Grand Final 2026</div>
              <h2 className="section-title">Event Details & Programme</h2>
            </div>
          </div>

          <div className="two-col" style={{ gap: 28 }}>
            {/* Left: details + schedule */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="panel reveal">
                <h2>Event Info</h2>
                <div className="gf-info-grid">
                  {[
                    ['📍', 'Venue',          'Central Conference Centre, London, UK'],
                    ['📅', 'Dates',          edition?.dates ?? 'July 14–18, 2026'],
                    ['🏛',  'Organiser',     edition?.organizer ?? 'SchoolConnect UK'],
                    ['👥', 'Participants',   '500+ students from 35+ countries'],
                    ['🏆', 'Awards',         'Gold, Silver, Bronze + Grand Champion'],
                    ['🗣',  'Language',      'English (all papers and events)'],
                  ].map(([icon, label, val]) => (
                    <div key={label} className="gf-info-row">
                      <span className="gf-info-icon">{icon}</span>
                      <span className="gf-info-label">{label}</span>
                      <span className="gf-info-val">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel reveal">
                <h2>Programme</h2>
                <div className="gf-schedule desk-only">
                  {SCHEDULE.map(({ date, title, desc }) => (
                    <div key={date} className="gf-sched-row">
                      <div className="gf-sched-date">{date}</div>
                      <div className="gf-sched-body">
                        <strong>{title}</strong>
                        <p>{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mob-only mob-timeline-card" style={{ marginTop: 16 }}>
                  {SCHEDULE.map(({ date, title, desc }) => (
                    <div key={date} className="mob-timeline-row">
                      <div className="mob-timeline-time">{date}</div>
                      <div className="mob-timeline-body">
                        <strong>{title}</strong>
                        <span>{desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: sidebar */}
            <div className="gf-sidebar desk-only">
              <div className="panel reveal" style={{ background: 'linear-gradient(135deg,#f3f0ff,#fff)', border: '1.5px solid rgba(125,92,255,.25)' }}>
                <h3>🏆 Qualification</h3>
                <p>Only top scorers from each country's National Final qualify. Quotas are set per country by the international committee. Your national representative will notify qualifiers.</p>
              </div>
              <div className="panel reveal">
                <h3>📋 Categories</h3>
                <div className="gf-cat-list">
                  {GF_CATEGORIES.map(({ cat, grade, icon }) => (
                    <div key={cat} className="gf-cat-row">
                      <span>{icon}</span>
                      <span className="gf-cat-name">{cat}</span>
                      <span className="gf-cat-grade">{grade}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel reveal">
                <h3>✈️ Travel & Logistics</h3>
                <p>Travel and accommodation are handled through your national representative. All registered participants receive a logistics guide 4 weeks before arrival.</p>
              </div>
              <div className="panel reveal">
                <h3>📞 Contact</h3>
                <p>For Grand Final logistics and registration, reach out through the contact form.</p>
                <Link className="btn btn-primary" href="/contact" style={{ marginTop: 14, display: 'inline-flex' }}>Contact Us →</Link>
              </div>
            </div>

            {/* Mobile: sidebar content as accordion */}
            <div className="mob-only">
              <div className="reg-list">
                <div className="reg-section open">
                  <button className="reg-header" type="button">
                    <div className="reg-header-left">
                      <div className="reg-icon">🏆</div>
                      <span className="reg-title">Qualification</span>
                    </div>
                    <span className="reg-arrow">›</span>
                  </button>
                  <div className="reg-body">
                    <p>Only top scorers from each country's National Final qualify. Quotas are set per country by the international committee. Your national representative will notify qualifiers.</p>
                  </div>
                </div>
                <div className="reg-section">
                  <button className="reg-header" type="button">
                    <div className="reg-header-left">
                      <div className="reg-icon">📋</div>
                      <span className="reg-title">Categories</span>
                    </div>
                    <span className="reg-arrow">›</span>
                  </button>
                  <div className="reg-body">
                    <div className="gf-cat-list">
                      {GF_CATEGORIES.map(({ cat, grade, icon }) => (
                        <div key={cat} className="gf-cat-row">
                          <span>{icon}</span>
                          <span className="gf-cat-name">{cat}</span>
                          <span className="gf-cat-grade">{grade}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="reg-section">
                  <button className="reg-header" type="button">
                    <div className="reg-header-left">
                      <div className="reg-icon">✈️</div>
                      <span className="reg-title">Travel &amp; Logistics</span>
                    </div>
                    <span className="reg-arrow">›</span>
                  </button>
                  <div className="reg-body">
                    <p>Travel and accommodation are handled through your national representative. All registered participants receive a logistics guide 4 weeks before arrival.</p>
                  </div>
                </div>
                <div className="reg-section">
                  <button className="reg-header" type="button">
                    <div className="reg-header-left">
                      <div className="reg-icon">📞</div>
                      <span className="reg-title">Contact</span>
                    </div>
                    <span className="reg-arrow">›</span>
                  </button>
                  <div className="reg-body">
                    <p>For Grand Final logistics and registration, reach out through the contact form.</p>
                    <Link className="btn btn-primary" href="/contact" style={{ marginTop: 14, display: 'inline-flex' }}>Contact Us →</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
