import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategoryBySlug } from '@/lib/globals'
import { pageMetadata } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) return {}
  return pageMetadata({
    title: `${cat.name}${cat.ageRange ? ` (${cat.ageRange})` : ''} — Category`,
    description: cat.description || `The ${cat.name} category of the Verbivore international English olympiad: exam structure, topics and sample questions.`,
    path: `/verbivore/categories/${slug}`,
    image: (cat.coverImage as any)?.url ?? undefined,
  })
}

function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const cat = await getCategoryBySlug(slug)
  if (!cat) notFound()

  const coverImg = (cat.coverImage as any)?.url ?? null
  const topics: string[] = (cat.topics || []).map((t: any) => t.topic)
  const sections: any[] = cat.contentSections || []

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/verbivore">Verbivore</Link> <span>›</span>
            <Link href="/verbivore/categories">Categories</Link> <span>›</span>
            <span>{cat.name}</span>
          </div>
          <h1>{cat.name}</h1>
          {cat.description && <p>{cat.description}</p>}
        </div>
      </section>

      {/* ── COVER + BADGES ──────────────────────────────── */}
      <section>
        <div className="container">
          <div
            className="travel-hero reveal"
            style={{ '--bg': coverImg ? `url('${coverImg}')` : `linear-gradient(135deg,${cat.color || '#ff821a'},${cat.color || '#ff821a'}99)` } as React.CSSProperties}
          >
            <div className="travel-hero-overlay" />
            <div className="travel-hero-content">
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                {cat.gradeRange && <span className="pill">{cat.gradeRange}</span>}
                {cat.ageRange && <span className="pill">{cat.ageRange}</span>}
              </div>
              <h2>{cat.name}</h2>
              {topics.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                  {topics.map((t) => <span key={t} className="cat-topic-tag">{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── VIDEO ────────────────────────────────────────── */}
      {cat.videoUrl && (
        <section className="section-soft">
          <div className="container">
            <div className="section-head">
              <div>
                <div className="kicker">Video</div>
                <h2 className="section-title reveal">{cat.name} — nümunə video.</h2>
              </div>
            </div>
            {isDirectVideoFile(cat.videoUrl) ? (
              // eslint-disable-next-line jsx-a11y/media-has-caption
              <video controls className="cat-video-frame" src={cat.videoUrl} />
            ) : (
              <div className="cat-video-frame" style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  src={cat.videoUrl}
                  title={`${cat.name} video`}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── ACCORDION SECTIONS ───────────────────────────── */}
      {sections.length > 0 && (
        <section className="section-soft">
          <div className="container" style={{ paddingBottom: 72 }}>
            <div className="section-head">
              <div>
                <div className="kicker">Details</div>
                <h2 className="section-title reveal">Exam format &amp; topics.</h2>
              </div>
              <p className="section-text reveal reveal-delay-1">Click any section below to expand.</p>
            </div>

            {/* Mobile quick-jump pills */}
            <div className="mob-only mob-reg-jumps">
              {sections.map((sec: any, i: number) => (
                <button
                  key={i}
                  className={`mob-reg-jump${i === 0 ? ' active' : ''}`}
                  data-reg-id={`cat-${i}`}
                >
                  {sec.icon || '📋'} {sec.title}
                </button>
              ))}
            </div>

            <div className="reg-list">
              {sections.map((sec: any, i: number) => (
                <div key={i} id={`reg-cat-${i}`} className={`reg-section${i === 0 ? ' open' : ''} reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}>
                  <button className="reg-header" type="button">
                    <div className="reg-header-left">
                      {sec.icon && <div className="reg-icon">{sec.icon}</div>}
                      <span className="reg-title">{sec.title}</span>
                    </div>
                    <span className="reg-arrow">›</span>
                  </button>
                  <div className="reg-body">
                    {sec.content.split('\n').filter((l: string) => l.trim()).map((line: string, li: number) => (
                      <p key={li}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
