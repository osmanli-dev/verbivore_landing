import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getExamTimes } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Exam Time", description: "Official Verbivore exam dates and times by country. Check when the Preliminary Round, National Final and Grand Final take place in your region.", path: "/verbivore/exam-time" })

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Confirmed:     { bg: 'rgba(47,207,127,.15)',  color: 'var(--green)',  label: '✅ Confirmed' },
  TBC:           { bg: 'rgba(255,130,26,.12)',  color: 'var(--orange)', label: '📅 Upcoming' },
  'Grand Final': { bg: 'rgba(42,167,255,.14)',  color: 'var(--sky)',    label: '🏆 Grand Final' },
}

export default async function ExamTimePage() {
  const docs = await getExamTimes()

  // Build unique country list for filter dropdown
  const countries = Array.from(new Set<string>(docs.map((d) => d.country?.name))).filter(Boolean)
  // Build unique year list for filter dropdown (most recent first)
  const years = Array.from(new Set<number>(docs.map((d) => d.year).filter(Boolean))).sort((a, b) => b - a)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/verbivore">Verbivore</Link> <span>›</span>
            <span>Exam Time</span>
          </div>
          <h1>Exam Time</h1>
          <p>Select a country to view round, exam date, venue and result status for each stage.</p>
        </div>
      </section>

      {/* FILTERS + DETAIL PANEL — desktop */}
      <section className="desk-only">
        <div className="container">
          <div className="two-col reveal">
            {/* Left — filters */}
            <article className="panel">
              <h2>Calendar filters</h2>
              <div className="form-grid" style={{ marginBottom: 18 }}>
                <div className="field">
                  <label>Contest Year</label>
                  <select id="yearFilter" defaultValue={years.length ? String(years[0]) : 'all'}>
                    <option value="all">All Years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Country</label>
                  <select id="countryFilter">
                    <option value="all">All Countries</option>
                    {countries.map((c) => {
                      const doc = docs.find((d) => d.country?.name === c)
                      return (
                        <option key={c} value={c}>
                          {doc?.country?.flag ? `${doc.country.flag} ${c}` : c}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className="field">
                  <label>Round</label>
                  <select id="roundFilter">
                    <option value="all">All Rounds</option>
                    <option value="Preliminary">Preliminary Round</option>
                    <option value="National Final">National Final</option>
                    <option value="Grand Final">Grand Final</option>
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select id="statusFilter">
                    <option value="all">All Statuses</option>
                    <option value="TBC">Upcoming / TBC</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Grand Final">Grand Final</option>
                  </select>
                </div>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.55 }}>
                Click any row in the table below to view detailed information for that country.
              </p>
            </article>

            {/* Right — country detail panel (populated by JS) */}
            <article className="panel" id="countryDetail">
              <h2>Selected country</h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 36 }}>🌍</div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--navy-2)', fontSize: 18 }}>
                    Select a country
                  </div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>
                    Use the filter or click a table row
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  ['Round', '—'],
                  ['Exam Date', '—'],
                  ['Venue', '—'],
                  ['Participants', '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: '#f7f8ff', borderRadius: 14 }}>
                    <span style={{ color: 'var(--muted)', fontWeight: 700 }}>{k}</span>
                    <span style={{ color: 'var(--navy)', fontWeight: 800 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '11px 14px', background: 'rgba(255,130,26,.10)', borderRadius: 14 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 700 }}>Result status</span>
                  <span style={{ color: 'var(--orange)', fontWeight: 800 }}>—</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* MOBILE — card list */}
      <section className="mob-only" style={{ padding: '20px 0 8px' }}>
        <div className="container">
          <div className="mob-exam-filters">
            <select className="mob-exam-select" id="mobYearFilter" defaultValue={years.length ? String(years[0]) : 'all'}>
              <option value="all">All Years</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <select className="mob-exam-select" id="mobRoundFilter">
              <option value="all">All Rounds</option>
              <option value="Preliminary">Preliminary</option>
              <option value="National Final">National Final</option>
              <option value="Grand Final">Grand Final</option>
            </select>
            <select className="mob-exam-select" id="mobStatusFilter">
              <option value="all">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="TBC">Upcoming</option>
              <option value="Grand Final">Grand Final</option>
            </select>
          </div>
          <div className="mob-exam-cards" id="mobExamCards">
            {docs.map((row) => {
              const st = STATUS_STYLE[row.status] || STATUS_STYLE['TBC']
              return (
                <div key={row.id} className="mob-exam-card" data-round={row.round} data-status={row.status} data-year={row.year}>
                  <div className="mob-exam-card-head">
                    <span className="mob-exam-card-flag">{row.country?.flag}</span>
                    <div>
                      <strong>{row.country?.name}</strong>
                      <span>{row.round}</span>
                    </div>
                    <span className="mob-exam-card-badge" style={{ background: st.bg, color: st.color }}>{st.label}</span>
                  </div>
                  <div className="mob-exam-card-body">
                    {row.date && <div><span>📅</span><span>{row.date}{row.time ? ` · ${row.time}` : ''}</span></div>}
                    {row.venue && <div><span>📍</span><span>{row.venue}</span></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* DETAILED TABLE + KEY DATES — desktop */}
      <section className="section-soft desk-only">
        <div className="container">
          <div className="section-head reveal">
            <div>
              <div className="kicker">Detailed schedule</div>
              <h2 className="section-title">All country exam information.</h2>
            </div>
            <p className="section-text">
              Click any row to view detailed information for that country&apos;s exam.
            </p>
          </div>
          <div className="panel reveal">
            <div className="exam-table-wrap">
              <table className="result-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Round</th>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="examTbody">
                  {docs.map((row) => {
                    const st = STATUS_STYLE[row.status] || STATUS_STYLE['TBC']
                    return (
                      <tr
                        key={row.id}
                        data-country={row.country?.name}
                        data-round={row.round}
                        data-status={row.status}
                        data-year={row.year}
                        style={{ cursor: 'pointer' }}
                        onClick={undefined}
                      >
                        <td><b>{row.country?.flag} {row.country?.name}</b></td>
                        <td>{row.round}</td>
                        <td>{row.date}{row.time ? ` · ${row.time}` : ''}</td>
                        <td>{row.venue}</td>
                        <td>
                          <span style={{
                            background: st.bg, color: st.color,
                            padding: '5px 12px', borderRadius: 999,
                            fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
                          }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key Dates */}
          <div className="panel reveal" style={{ marginTop: 24 }}>
            <h3>🗓 Key Dates 2026</h3>
            <div className="timeline" style={{ marginTop: 14 }}>
              {[
                { d: 'Sep\n2026', label: 'Preliminary Round', sub: 'School-based in all participating countries' },
                { d: 'Nov\n2026', label: 'National Finals', sub: 'Top scorers per country advance' },
                { d: 'Jul 14–18\n2026', label: 'Grand Final', sub: 'London, United Kingdom' },
              ].map(({ d, label, sub }) => (
                <div key={label} className="timeline-row">
                  <div className="date-badge" style={{ color: 'var(--orange-2)', whiteSpace: 'pre-line' }}>{d}</div>
                  <div>
                    <b style={{ color: 'var(--navy-2)', display: 'block', fontWeight: 800 }}>{label}</b>
                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* KEY DATES — mobile */}
      <section className="mob-only section-soft" style={{ padding: '0 0 40px' }}>
        <div className="container">
          <div className="panel">
            <h3>🗓 Key Dates 2026</h3>
            <div className="timeline" style={{ marginTop: 14 }}>
              {[
                { d: 'Sep 2026', label: 'Preliminary Round', sub: 'School-based across all countries' },
                { d: 'Nov 2026', label: 'National Finals', sub: 'Top scorers per country advance' },
                { d: 'Jul 14–18', label: 'Grand Final', sub: 'London, United Kingdom' },
              ].map(({ d, label, sub }) => (
                <div key={label} className="timeline-row">
                  <div className="date-badge" style={{ color: 'var(--orange-2)' }}>{d}</div>
                  <div>
                    <b style={{ color: 'var(--navy-2)', display: 'block', fontWeight: 800 }}>{label}</b>
                    <span style={{ color: 'var(--muted)', fontSize: 14 }}>{sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
