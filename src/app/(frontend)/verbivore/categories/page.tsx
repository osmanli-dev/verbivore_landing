import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getCategories } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Age Categories", description: "Verbivore age categories from Junior to Senior: age ranges, exam structure and topics for each level of the international English olympiad.", path: "/verbivore/categories" })

export default async function CategoriesPage() {
  const cats = await getCategories()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> <span>›</span> <Link href="/verbivore">Verbivore</Link> <span>›</span> <span>Categories</span></div>
          <h1>Contest Categories</h1>
          <p>Verbivore has four age-based categories, each with its own exam paper, scoring scale and award structure. All questions are in English only.</p>
        </div>
      </section>
      {/* Desktop grid */}
      <section className="desk-only">
        <div className="container">
          <div className="cat-grid">
            {cats.map((c) => {
              const topics: string[] = (c.topics || []).map((t: any) => t.topic)
              return (
                <Link key={c.id} href={`/verbivore/categories/${c.slug}`} className="cat-card">
                  <div className="cat-cover" style={{ background: `linear-gradient(135deg,${c.color},${c.color}99)` }}>
                    <div className="cat-cover-overlay"></div>
                    <div className="cat-cover-labels" style={{ bottom: 14, left: 14, position: 'absolute', display: 'flex', gap: 7 }}>
                      <span className="badge">{c.gradeRange}</span>
                      <span className="badge">{c.ageRange}</span>
                    </div>
                  </div>
                  <div className="cat-body">
                    <h3>{c.name}</h3>
                    <p>{c.description}</p>
                    <div className="cat-topics">
                      {topics.map((t) => <span key={t} className="cat-topic-tag">{t}</span>)}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Mobile: tab-switcher + card */}
      <section className="mob-only" style={{ padding: '20px 0 48px' }}>
        <div className="container">
          {/* Category tabs */}
          <div className="mob-cat-tabs">
            {cats.map((c, i) => (
              <button key={c.id} className={`mob-cat-tab${i === 0 ? ' active' : ''}`}
                data-cat={i} style={{ '--cat-color': c.color } as React.CSSProperties}>
                {c.name}
              </button>
            ))}
          </div>
          {/* Cards (one shown at a time via JS) */}
          {cats.map((c, i) => {
            const topics: string[] = (c.topics || []).map((t: any) => t.topic)
            return (
              <div key={c.id} className={`mob-cat-panel${i === 0 ? ' active' : ''}`} data-panel={i}>
                <div className="mob-cat-hero" style={{ background: `linear-gradient(135deg,${c.color},${c.color}88)` }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span className="badge">{c.gradeRange}</span>
                    <span className="badge">{c.ageRange}</span>
                  </div>
                  <h2>{c.name}</h2>
                  <p>{c.description}</p>
                </div>
                <div className="mob-cat-topics">
                  <div className="mob-section-label" style={{ marginTop: 0, marginBottom: 12 }}>Topics covered</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {topics.map((t) => <span key={t} className="cat-topic-tag">{t}</span>)}
                  </div>
                </div>
                <div style={{ padding: '0 4px', marginTop: 16 }}>
                  <Link href={`/verbivore/categories/${c.slug}`} className="btn btn-primary btn-sm">Ətraflı bax →</Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </>
  )
}
