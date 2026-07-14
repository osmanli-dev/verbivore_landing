import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getPreliminaryResources, getPreliminaryPage } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Preliminary Round", description: "The first stage of Verbivore, held in schools across all participating countries and open to all registered students.", path: "/verbivore/preliminary-round" })

type CatGroup   = { category: string; grade: string; files: { title: string; pdfUrl: string }[] }
type RoundGroup = { roundLabel: string; roundIcon: string; categories: CatGroup[] }
type ResultRound = { roundLabel: string; roundIcon: string; countries: { country: string; meta: string; pdfUrl: string }[] }

function groupByRound(items: any[]): RoundGroup[] {
  const map: Record<string, RoundGroup> = {}
  for (const item of items) {
    if (!map[item.roundLabel]) map[item.roundLabel] = { roundLabel: item.roundLabel, roundIcon: item.roundIcon || '📋', categories: [] }
    const r = map[item.roundLabel]
    let cat = r.categories.find(c => c.category === item.category)
    if (!cat) { cat = { category: item.category || '', grade: item.grade || '', files: [] }; r.categories.push(cat) }
    cat.files.push({ title: item.title || '', pdfUrl: item.pdfUrl || '#' })
  }
  return Object.values(map)
}

function groupResults(items: any[]): ResultRound[] {
  const map: Record<string, ResultRound> = {}
  for (const item of items) {
    if (!map[item.roundLabel]) map[item.roundLabel] = { roundLabel: item.roundLabel, roundIcon: item.roundIcon || '🏅', countries: [] }
    map[item.roundLabel].countries.push({ country: item.country?.name || '', meta: item.countryMeta || 'PDF', pdfUrl: item.pdfUrl || '#' })
  }
  return Object.values(map)
}

const DEFAULT_STEPS = [
  { number: '01', title: 'Registration', text: 'Schools register students through the accredited national representative before the deadline.' },
  { number: '02', title: 'Exam Day',      text: 'Students sit the paper in their own school, supervised by a teacher. Duration: 90 minutes.' },
  { number: '03', title: 'Results',       text: 'Results are published within 4 weeks. Top scorers advance to the National Final.' },
]
const DEFAULT_KEY_INFO = [
  { icon: '⏱️', label: 'Duration',    value: '90 minutes' },
  { icon: '📋', label: 'Format',      value: 'Paper-based / Online' },
  { icon: '🌍', label: 'Open to',     value: 'All registered students' },
  { icon: '🏆', label: 'Advancement', value: 'Top scorers by category' },
]
const DEFAULT_TOPIC_TAGS = ['Vocabulary','Reading','Grammar','Logic','Word Formation']

export default async function PreliminaryRoundPage() {
  const docs = await getPreliminaryResources()
  const pp = await getPreliminaryPage()

  const sampleGroups   = groupByRound(docs.filter((d: any) => d.type === 'sample-question'))
  const syllabusGroups = groupByRound(docs.filter((d: any) => d.type === 'syllabus'))
  const resultGroups   = groupResults(docs.filter((d: any) => d.type === 'result'))

  const steps    = pp.steps?.length    > 0 ? pp.steps    : DEFAULT_STEPS
  const keyInfo  = pp.keyInfo?.length  > 0 ? pp.keyInfo  : DEFAULT_KEY_INFO
  const topicTags = pp.topicTags?.length > 0 ? pp.topicTags : DEFAULT_TOPIC_TAGS

  return (
    <>
      {/* ── HERO ── */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/verbivore">Verbivore</Link> <span>›</span>
            <span>Preliminary Round</span>
          </div>
          <h1>{pp.heroTitle}</h1>
          <p>{pp.heroSubtitle}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
            <a className="btn btn-primary" href="#sample-questions">Nümunə suallar</a>
            <a className="btn btn-blue"    href="#syllabus">Sillabus</a>
            <a className="btn btn-outline" href="#results">Nəticələr</a>
          </div>
        </div>
      </section>

      {/* ── INFO GRID ── */}
      <section className="desk-only">
        <div className="container">
          <div className="prelim-info-grid">

            {/* How it works */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--line)' }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, color: 'var(--navy-2)', letterSpacing: '-.3px' }}>{pp.howItWorksTitle}</h2>
                <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14, lineHeight: 1.55 }}>{pp.howItWorksSubtitle}</p>
              </div>
              <div className="prelim-step-list">
                {steps.map(({ number, title, text }: any) => (
                  <div key={number} className="prelim-step">
                    <span className="prelim-step-no">{number}</span>
                    <div>
                      <strong style={{ display: 'block', color: 'var(--navy-2)', fontWeight: 950, marginBottom: 5, fontSize: 15 }}>{title}</strong>
                      <p style={{ margin: 0, color: 'var(--muted)', fontSize: 14, lineHeight: 1.55, fontWeight: 600 }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Side cards */}
            <div style={{ display: 'grid', gap: 16 }}>
              <div className="panel">
                <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 950, color: 'var(--navy-2)' }}>{pp.keyInfoTitle}</h3>
                <div className="prelim-key-table">
                  {keyInfo.map(({ label, value }: any) => (
                    <div key={label} className="prelim-key-row">
                      <span style={{ color: 'var(--muted)' }}>{label}</span>
                      <span>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3 style={{ margin: '0 0 14px', fontSize: 17, fontWeight: 950, color: 'var(--navy-2)' }}>{pp.topicsTitle}</h3>
                <div className="prelim-topic-tags">
                  {topicTags.map((t: string) => (
                    <span key={t} className="prelim-topic-tag">{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MOBILE: Key info strip + How-it-works stepper + Topics ── */}
      <section className="mob-only" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="mob-stat-strip" style={{ marginBottom: 18 }}>
            {keyInfo.map(({ icon, label, value }: any) => (
              <div key={label} className="mob-stat-pill wide">
                <div className="mob-stat-pill-icon">{icon}</div>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="panel mob-info-panel">
            <h3>🗺️ How it works</h3>
            <div className="mob-stepper">
              {steps.map(({ number, title, text }: any) => (
                <div key={number} className="mob-stepper-item">
                  <div className="mob-stepper-node">{Number(number)}</div>
                  <div className="mob-stepper-body">
                    <strong>{title}</strong>
                    <p>{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="panel mob-info-panel">
            <h3>{pp.topicsTitle}</h3>
            <div className="prelim-topic-tags">
              {topicTags.map((t: string) => (
                <span key={t} className="prelim-topic-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SAMPLE QUESTIONS ── */}
      <section id="sample-questions" className="prelim-resource-section section-soft">
        <div className="container">
          <div className="prelim-section-head">
            <h2>{pp.sampleQuestionsTitle}</h2>
            <p>{pp.sampleQuestionsText}</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <ResourceAccordion groups={sampleGroups} />
          </div>
        </div>
      </section>

      {/* ── SYLLABUS ── */}
      <section id="syllabus" className="prelim-resource-section">
        <div className="container">
          <div className="prelim-section-head">
            <h2>{pp.syllabusTitle}</h2>
            <p>{pp.syllabusText}</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <ResourceAccordion groups={syllabusGroups} />
          </div>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section id="results" className="prelim-resource-section section-soft">
        <div className="container">
          <div className="prelim-section-head">
            <h2>{pp.resultsTitle}</h2>
            <p>{pp.resultsText}</p>
          </div>
          <div className="panel" style={{ padding: 16 }}>
            <ResultAccordion groups={resultGroups} />
          </div>
        </div>
      </section>
    </>
  )
}

/* ── Accordion sub-components ─────────────────────────── */

function ResourceAccordion({ groups }: { groups: RoundGroup[] }) {
  if (!groups.length) return (
    <p style={{ color: 'var(--muted)', padding: '16px 4px', textAlign: 'center', fontSize: 14 }}>Hələ heç bir məlumat əlavə edilməyib.</p>
  )
  return (
    <>
      <div className="desk-only">
        {groups.map((round, ri) => (
          <div key={round.roundLabel} className={`prelim-round${ri === 0 ? ' open' : ''}`}>
            <button className="prelim-round-btn" type="button">
              <span className="prelim-round-title">
                <span className="prelim-round-icon">{round.roundIcon}</span>
                {round.roundLabel}
              </span>
              <span className="prelim-chevron">⌄</span>
            </button>
            <div className="prelim-round-body">
              {round.categories.map((cat, ci) => (
                <div key={cat.category} className={`prelim-category${ci === 0 ? ' open' : ''}`}>
                  <button className="prelim-cat-btn" type="button">
                    <span className="prelim-cat-title">
                      <strong>{cat.category}</strong>
                      <span>{cat.grade}</span>
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="prelim-pdf-count">{cat.files.length} PDF</span>
                      <span className="prelim-chevron">⌄</span>
                    </span>
                  </button>
                  <div className="prelim-cat-body">
                    {cat.files.length === 0
                      ? <p style={{ color: 'var(--muted)', fontSize: 13, margin: '8px 0' }}>Bu kateqoriya üçün PDF hələ əlavə edilməyib.</p>
                      : (
                        <div className="prelim-pdf-list">
                          {cat.files.map((f, fi) => (
                            <a key={fi} className="prelim-pdf-item" href={f.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <span className="prelim-pdf-icon">PDF</span>
                              <span className="prelim-pdf-info">
                                <strong>{f.title}</strong>
                                <span>Yüklə</span>
                              </span>
                            </a>
                          ))}
                        </div>
                      )
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── MOBILE: round switcher (flattened to round → category) ── */}
      <div className="mob-only" data-round-switch>
        {groups.length > 1 && (
          <div className="mob-round-tabs">
            {groups.map((round, ri) => (
              <button key={round.roundLabel} type="button" className={`mob-round-tab${ri === 0 ? ' active' : ''}`} data-round-tab={ri}>
                <span>{round.roundIcon}</span>{round.roundLabel}
              </button>
            ))}
          </div>
        )}
        {groups.map((round, ri) => (
          <div key={round.roundLabel} className={`mob-round-panel${ri === 0 ? ' active' : ''}`} data-round-panel={ri}>
            {round.categories.map((cat, ci) => (
              <div key={cat.category} className={`prelim-category${ci === 0 ? ' open' : ''}`}>
                <button className="prelim-cat-btn" type="button">
                  <span className="prelim-cat-title">
                    <strong>{cat.category}</strong>
                    <span>{cat.grade}</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="prelim-pdf-count">{cat.files.length} PDF</span>
                    <span className="prelim-chevron">⌄</span>
                  </span>
                </button>
                <div className="prelim-cat-body">
                  {cat.files.length === 0
                    ? <p style={{ color: 'var(--muted)', fontSize: 13, margin: '8px 0' }}>Bu kateqoriya üçün PDF hələ əlavə edilməyib.</p>
                    : (
                      <div className="prelim-pdf-list">
                        {cat.files.map((f, fi) => (
                          <a key={fi} className="prelim-pdf-item" href={f.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <span className="prelim-pdf-icon">PDF</span>
                            <span className="prelim-pdf-info">
                              <strong>{f.title}</strong>
                              <span>Yüklə</span>
                            </span>
                          </a>
                        ))}
                      </div>
                    )
                  }
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

function ResultAccordion({ groups }: { groups: ResultRound[] }) {
  if (!groups.length) return (
    <p style={{ color: 'var(--muted)', padding: '16px 4px', textAlign: 'center', fontSize: 14 }}>Hələ heç bir nəticə əlavə edilməyib.</p>
  )
  return (
    <>
      <div className="desk-only">
        {groups.map((round, ri) => (
          <div key={round.roundLabel} className={`prelim-round${ri === 0 ? ' open' : ''}`}>
            <button className="prelim-round-btn" type="button">
              <span className="prelim-round-title">
                <span className="prelim-round-icon">{round.roundIcon}</span>
                {round.roundLabel}
              </span>
              <span className="prelim-chevron">⌄</span>
            </button>
            <div className="prelim-round-body" style={{ paddingTop: 0 }}>
              <div className="prelim-country-grid">
                {round.countries.map(c => (
                  <a key={c.country} className="prelim-pdf-item" href={c.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                    <span className="prelim-pdf-icon">PDF</span>
                    <span className="prelim-pdf-info">
                      <strong>{c.country}</strong>
                      <span>{c.meta}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MOBILE: round switcher ── */}
      <div className="mob-only" data-round-switch>
        {groups.length > 1 && (
          <div className="mob-round-tabs">
            {groups.map((round, ri) => (
              <button key={round.roundLabel} type="button" className={`mob-round-tab${ri === 0 ? ' active' : ''}`} data-round-tab={ri}>
                <span>{round.roundIcon}</span>{round.roundLabel}
              </button>
            ))}
          </div>
        )}
        {groups.map((round, ri) => (
          <div key={round.roundLabel} className={`mob-round-panel${ri === 0 ? ' active' : ''}`} data-round-panel={ri}>
            <div className="prelim-country-grid">
              {round.countries.map(c => (
                <a key={c.country} className="prelim-pdf-item" href={c.pdfUrl} target="_blank" rel="noopener noreferrer" download>
                  <span className="prelim-pdf-icon">PDF</span>
                  <span className="prelim-pdf-info">
                    <strong>{c.country}</strong>
                    <span>{c.meta}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
