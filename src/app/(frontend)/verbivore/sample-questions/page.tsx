import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getAllSampleResources, getSampleQuestionsPage } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Sample Questions & Syllabus", description: "Download sample questions and syllabus PDFs for every Verbivore stage and age category, structured by round and level.", path: "/verbivore/sample-questions" })

type CatGroup   = { category: string; grade: string; files: { title: string; pdfUrl: string }[] }
type RoundGroup = { roundLabel: string; roundIcon: string; categories: CatGroup[] }

const STAGE_ORDER = ['preliminary', 'national-final', 'grand-final']

function groupByRound(items: any[]): RoundGroup[] {
  const map: Record<string, RoundGroup & { _stageKey: string }> = {}
  for (const item of items) {
    if (!map[item.roundLabel]) {
      map[item.roundLabel] = { roundLabel: item.roundLabel, roundIcon: item.roundIcon || '📋', categories: [], _stageKey: item.stage || 'preliminary' }
    }
    const r = map[item.roundLabel]
    let cat = r.categories.find(c => c.category === item.category)
    if (!cat) { cat = { category: item.category || '', grade: item.grade || '', files: [] }; r.categories.push(cat) }
    cat.files.push({ title: item.title || '', pdfUrl: item.pdfUrl || '#' })
  }
  return Object.values(map).sort((a, b) => STAGE_ORDER.indexOf(a._stageKey) - STAGE_ORDER.indexOf(b._stageKey))
}

const DEFAULT_CATEGORY_CHIPS = [
  { icon: '📂', label: 'Kiçik A' },
  { icon: '📂', label: 'Kiçik B' },
  { icon: '📂', label: 'Orta' },
  { icon: '📂', label: 'Böyük' },
]
const DEFAULT_TOPIC_TAGS = ['Lüğət', 'Oxu', 'Qrammatika', 'Məntiq', 'İdiomlar', 'Söz əmələ gəlməsi']
const DEFAULT_STAGES_LIST = ['İlkin seçim mərhələsi', 'Milli final mərhələsi', 'Grand Final mərhələsi']
const DEFAULT_CATEGORIES_LIST = ['Kiçik A — 3–4-cü sinif', 'Kiçik B — 5–6-cı sinif', 'Orta səviyyə — 7–8-ci sinif', 'Böyük — 9–11-ci sinif']
const DEFAULT_SYLLABUS_STRUCTURE = ['İlkin seçim üçün mövzu bölgüsü', 'Milli final üçün dərinləşdirilmiş istiqamətlər', 'Grand Final üçün genişləndirilmiş proqram']
const DEFAULT_USAGE_STEPS = ['Mərhələ seçilir', 'Kateqoriya açılır', 'Uyğun PDF yüklənir']

export default async function SampleQuestionsPage() {
  const docs = await getAllSampleResources()
  const sp = await getSampleQuestionsPage()

  const sampleGroups   = groupByRound(docs.filter((d: any) => d.type === 'sample-question'))
  const syllabusGroups = groupByRound(docs.filter((d: any) => d.type === 'syllabus'))

  const categoryChips     = sp.categoryChips?.length     > 0 ? sp.categoryChips     : DEFAULT_CATEGORY_CHIPS
  const topicTags         = sp.topicTags?.length         > 0 ? sp.topicTags         : DEFAULT_TOPIC_TAGS
  const stagesList        = sp.stagesList?.length        > 0 ? sp.stagesList        : DEFAULT_STAGES_LIST
  const categoriesList    = sp.categoriesList?.length    > 0 ? sp.categoriesList    : DEFAULT_CATEGORIES_LIST
  const syllabusStructure = sp.syllabusStructure?.length > 0 ? sp.syllabusStructure : DEFAULT_SYLLABUS_STRUCTURE
  const usageSteps        = sp.usageSteps?.length        > 0 ? sp.usageSteps        : DEFAULT_USAGE_STEPS

  return (
    <>
      {/* HERO */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/verbivore">Verbivore</Link> <span>›</span>
            <span>Nümunə Suallar</span>
          </div>
          <h1>{sp.heroTitle}</h1>
          <p>{sp.heroSubtitle}</p>
        </div>
      </section>

      {/* MAIN */}
      <section>
        <div className="container">

          {/* Tabs */}
          <div className="res-tabs" role="tablist">
            <button className="res-tab active" data-res-tab="res-samples" type="button">📄 Nümunə suallar</button>
            <button className="res-tab" data-res-tab="res-syllabus" type="button">📚 Sillabus</button>
          </div>

          {/* Tab: Sample Questions */}
          <div id="res-samples" className="res-panel active">
            {/* Mobile: quick-reference chips above the accordion */}
            <div className="mob-only" style={{ marginBottom: 16 }}>
              <div className="mob-res-chips">
                {categoryChips.map((c: any) => (
                  <span key={c.label} className="mob-res-chip">{c.icon} {c.label}</span>
                ))}
              </div>
              <div className="prelim-topic-tags">
                {topicTags.map((t: string) => (
                  <span key={t} className="prelim-topic-tag">{t}</span>
                ))}
              </div>
            </div>
            <div className="res-grid">
              {/* Accordion */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, color: 'var(--navy-2)', letterSpacing: '-.3px' }}>{sp.sampleSectionTitle}</h2>
                    <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14, lineHeight: 1.55 }}>{sp.sampleSectionText}</p>
                  </div>
                  <span className="res-badge">{sampleGroups.length} mərhələ</span>
                </div>
                <div style={{ padding: 16 }}>
                  <ResourceAccordion groups={sampleGroups} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="desk-only">
                <aside className="res-side">
                  <div className="panel">
                    <h3>📌 Mərhələlər</h3>
                    <ul className="res-side-list">
                      {stagesList.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="panel">
                    <h3>📂 Kateqoriyalar</h3>
                    <ul className="res-side-list">
                      {categoriesList.map((c: string) => <li key={c}>{c}</li>)}
                    </ul>
                  </div>
                  <div className="panel">
                    <h3>🎯 Əhatə olunan istiqamətlər</h3>
                    <div className="prelim-topic-tags" style={{ marginTop: 4 }}>
                      {topicTags.map((t: string) => (
                        <span key={t} className="prelim-topic-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>

          {/* Tab: Syllabus */}
          <div id="res-syllabus" className="res-panel">
            {/* Mobile: condensed syllabus structure above the accordion */}
            <div className="mob-only panel mob-info-panel" style={{ marginBottom: 16 }}>
              <h3>✅ Sillabus strukturu</h3>
              <ul className="res-side-list">
                {syllabusStructure.map((s: string) => <li key={s}>{s}</li>)}
              </ul>
            </div>
            <div className="res-grid">
              {/* Accordion */}
              <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '22px 26px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, color: 'var(--navy-2)', letterSpacing: '-.3px' }}>{sp.syllabusSectionTitle}</h2>
                    <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14, lineHeight: 1.55 }}>{sp.syllabusSectionText}</p>
                  </div>
                  <span className="res-badge">{sp.syllabusBadge}</span>
                </div>
                <div style={{ padding: 16 }}>
                  <ResourceAccordion groups={syllabusGroups} />
                </div>
              </div>

              {/* Sidebar */}
              <div className="desk-only">
                <aside className="res-side">
                  <div className="panel">
                    <h3>✅ Sillabus strukturu</h3>
                    <ul className="res-side-list">
                      {syllabusStructure.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="panel">
                    <h3>ℹ️ İstifadə qaydası</h3>
                    <ul className="res-side-list">
                      {usageSteps.map((s: string) => <li key={s}>{s}</li>)}
                    </ul>
                  </div>
                </aside>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}

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
