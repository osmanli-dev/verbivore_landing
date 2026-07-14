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
    title: `${base} - Participants & Medals`,
    description: `Country delegations, participants and the medal table of the ${base}.`,
    path: `/editions/${slug}/participants`,
    image: (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? undefined,
  })
}

function medalClass(medal: string | undefined): string {
  if (!medal) return ''
  if (medal === 'Gold')               return 'medal-gold'
  if (medal === 'Silver')             return 'medal-silver'
  if (medal === 'Bronze')             return 'medal-bronze'
  if (medal === 'Honorable Mention')  return 'medal-hm'
  return ''
}

function medalLabel(medal: string | undefined): string {
  if (!medal) return '—'
  if (medal === 'Honorable Mention') return 'H.M.'
  return medal
}

export default async function EditionParticipantsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) notFound()

  const delegations: any[] = ed.countryDelegations || []

  return (
    <>
      <section className="page-hero edition-hero" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff', paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/editions" style={{ color: 'rgba(255,255,255,.7)' }}>Editions</Link>
            <span>›</span>
            <Link href={`/editions/${slug}`} style={{ color: 'rgba(255,255,255,.7)' }}>{ed.shortTitle}</Link>
            <span>›</span>
            <span>Participants</span>
          </div>
          <h1 style={{ color: '#fff' }}>{ed.shortTitle} Participants</h1>
          <p style={{ color: 'rgba(255,255,255,.84)' }}>Participating country delegations, team leaders and student lists. Click any country to expand its delegation.</p>
          <EditionTabs slug={slug} active="participants" />
        </div>
      </section>

      <section>
        <div className="container" style={{ paddingBottom: 72 }}>
          {delegations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>
              Participant list will be published after registration closes.
            </div>
          ) : (
            <>
              <div className="section-head">
                <div>
                  <div className="kicker">Country delegations</div>
                  <h2 className="section-title reveal">{ed.participantsCount || `${delegations.length}+`} countries represented.</h2>
                </div>
                <p className="section-text reveal reveal-delay-1">Click on any country card to expand and view the full student list for that delegation.</p>
              </div>

              {/* Search */}
              <div className="participant-search-bar reveal" style={{ marginBottom: 20 }}>
                <input
                  type="text"
                  id="participantSearch"
                  placeholder="Search by student name or country..."
                  autoComplete="off"
                  style={{
                    width: '100%', padding: '14px 20px', borderRadius: 999,
                    border: '1px solid var(--line)', background: '#fff',
                    fontSize: 15, fontWeight: 700, color: 'var(--navy)', outline: 'none',
                  }}
                />
              </div>
              <div id="participantNoResults" style={{ display: 'none', textAlign: 'center', padding: 24, color: 'var(--muted)', fontWeight: 700 }}>
                No matches found. Try a different name or country.
              </div>

              <div className="participant-list reveal">
                {delegations.map((del: any, di: number) => (
                  <div key={di} className={`participant-group${di === 0 ? ' open' : ''}`} data-country={del.country?.name}>
                    <button className="participant-header" type="button">
                      <div className="participant-header-left">
                        {del.country?.flag && <div className="participant-flag">{del.country.flag}</div>}
                        <div className="participant-info">
                          <h4>{del.country?.name}</h4>
                          {del.teamLeader && (
                            <p>Team Leader: {del.teamLeader}{del.organization ? ` · ${del.organization}` : ''}</p>
                          )}
                        </div>
                      </div>
                      <div className="participant-meta">
                        <span className="participant-count">{(del.students || []).length} students</span>
                        <span className="participant-arrow">›</span>
                      </div>
                    </button>
                    <div className="participant-body">
                      {del.students && del.students.length > 0 ? (
                        <>
                          <div className="table-scroll desk-only"><table className="student-table" style={{ minWidth: 400 }}>
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Class</th>
                                <th>Category</th>
                                <th>Score</th>
                                <th>Medal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {del.students.map((s: any, si: number) => (
                                <tr key={si} data-student={s.name}>
                                  <td>{si + 1}</td>
                                  <td>{s.name}</td>
                                  <td>{s.class}</td>
                                  <td>{s.category}</td>
                                  <td>{s.score}</td>
                                  <td className={medalClass(s.medal)}>{medalLabel(s.medal)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table></div>
                          <div className="mob-only mob-student-list">
                            {del.students.map((s: any, si: number) => (
                              <div key={si} className="mob-student-row" data-student={s.name}>
                                <div className="mob-student-name">{si + 1}. {s.name}</div>
                                <div className="mob-student-meta">
                                  <span className="mob-student-class">{s.class} · {s.category}</span>
                                  <span className="mob-student-score-medal">
                                    <span className="mob-student-score">{s.score} pts</span>
                                    {s.medal && <span className={`mob-medal-pill ${medalClass(s.medal)}`}>{medalLabel(s.medal)}</span>}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p style={{ color: 'var(--muted)', padding: '16px 0', fontSize: 14 }}>No students listed yet.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {ed.participantsNote && (
                <p style={{ marginTop: 20, color: 'var(--muted)', fontSize: 13, fontStyle: 'italic' }}>{ed.participantsNote}</p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
