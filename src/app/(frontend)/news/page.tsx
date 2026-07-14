import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getNewsItems } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "News & Announcements", description: "Latest Verbivore news: announcements, event updates and press releases from the international English olympiad.", path: "/news" })

const CATEGORY_COLOR: Record<string, { bg: string; color: string; accent: string }> = {
  Announcement: { bg: 'rgba(255,130,26,.10)', color: 'var(--orange)',  accent: 'var(--orange)' },
  Event:        { bg: 'rgba(42,167,255,.10)',  color: 'var(--sky)',     accent: 'var(--sky)' },
  Update:       { bg: 'rgba(47,207,127,.10)',  color: 'var(--green)',   accent: 'var(--green)' },
  Press:        { bg: 'rgba(125,92,255,.10)',  color: 'var(--purple)',  accent: 'var(--purple)' },
}

const CATEGORY_ICON: Record<string, string> = {
  Announcement: '📢',
  Event:        '📅',
  Update:       '🔔',
  Press:        '📰',
}

export default async function NewsPage() {
  const allNews = await getNewsItems()
  const news = allNews.filter((n: any) => n.published !== false)

  const featured = news[0] ?? null
  const rest     = news.slice(1)

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span> <span>News &amp; Announcements</span>
          </div>
          <h1>News &amp; Announcements</h1>
          <p style={{ maxWidth: 540 }}>
            Official updates, press releases and event announcements from the Verbivore coordination team.
          </p>
        </div>
      </section>

      {/* ── DESKTOP: featured + grid ── */}
      <section className="desk-only" style={{ paddingBottom: 80 }}>
        <div className="container">
          {news.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>
              No news published yet. Check back soon!
            </div>
          ) : (
            <>
              {featured && (() => {
                const cat = featured.category || 'Announcement'
                const clr = CATEGORY_COLOR[cat] || CATEGORY_COLOR.Announcement
                const img = featured.image && typeof featured.image === 'object' ? (featured.image as any).url : null
                return (
                  <Link href={`/news/${featured.id}`} className="news-featured-link">
                    <article className="news-featured-card reveal">
                      {img ? <div className="news-featured-img" style={{ backgroundImage: `url('${img}')` }} /> : <div className="news-featured-img news-featured-img--placeholder" />}
                      <div className="news-featured-body">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                          <span className="news-cat-badge" style={{ background: clr.bg, color: clr.color }}>{CATEGORY_ICON[cat]} {cat}</span>
                          {featured.date && <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>{featured.date}</span>}
                          <span className="news-featured-pill">Featured</span>
                        </div>
                        <h2 className="news-featured-title">{featured.text}</h2>
                        {featured.excerpt && <p className="news-featured-excerpt">{featured.excerpt}</p>}
                        <span className="news-read-btn" style={{ borderColor: clr.accent, color: clr.accent }}>Read article →</span>
                      </div>
                    </article>
                  </Link>
                )
              })()}
              {rest.length > 0 && (
                <div className="news-grid">
                  {rest.map((item: any, i: number) => {
                    const cat = item.category || 'Announcement'
                    const clr = CATEGORY_COLOR[cat] || CATEGORY_COLOR.Announcement
                    const img = item.image && typeof item.image === 'object' ? item.image.url : null
                    return (
                      <Link key={item.id} href={`/news/${item.id}`} className={`news-card-link reveal reveal-delay-${(i % 3) + 1}`}>
                        <article className="news-card" style={{ borderTopColor: clr.accent }}>
                          {img && <div className="news-card-img" style={{ backgroundImage: `url('${img}')` }} />}
                          <div className="news-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                              <span className="news-cat-badge" style={{ background: clr.bg, color: clr.color }}>{CATEGORY_ICON[cat]} {cat}</span>
                              {item.date && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>{item.date}</span>}
                            </div>
                            <h3 className="news-card-title">{item.text}</h3>
                            {item.excerpt && <p className="news-card-excerpt">{item.excerpt}</p>}
                            <span className="news-card-cta" style={{ color: clr.color }}>Read more →</span>
                          </div>
                        </article>
                      </Link>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── MOBILE: compact news list ── */}
      <section className="mob-only" style={{ padding: '16px 0 48px' }}>
        <div className="container">
          {news.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontWeight: 700 }}>No news yet.</p>
          ) : (
            <div className="mob-news-list">
              {news.map((item: any, i: number) => {
                const cat = item.category || 'Announcement'
                const clr = CATEGORY_COLOR[cat] || CATEGORY_COLOR.Announcement
                const img = item.image && typeof item.image === 'object' ? item.image.url : null
                return (
                  <Link key={item.id} href={`/news/${item.id}`} className="mob-news-row">
                    {img
                      ? <div className="mob-news-thumb" style={{ backgroundImage: `url('${img}')` }} />
                      : <div className="mob-news-thumb mob-news-thumb--placeholder" style={{ background: clr.bg }}><span>{CATEGORY_ICON[cat]}</span></div>
                    }
                    <div className="mob-news-body">
                      <div className="mob-news-meta">
                        <span className="mob-news-badge" style={{ color: clr.color, background: clr.bg }}>{CATEGORY_ICON[cat]} {cat}</span>
                        {item.date && <span className="mob-news-date">{item.date}</span>}
                        {i === 0 && <span className="mob-news-featured-pill">Latest</span>}
                      </div>
                      <h3 className="mob-news-title">{item.text}</h3>
                      {item.excerpt && <p className="mob-news-excerpt">{item.excerpt}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
