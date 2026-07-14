import Link from 'next/link'
import { notFound } from 'next/navigation'
import { directusFetch, fileUrl } from '@/lib/directus'
import { getNewsItems } from '@/lib/globals'
import { pageMetadata, plainText, jsonLd, SITE_URL, SITE_NAME } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const n = await directusFetch(`/items/news/${encodeURIComponent(id)}?fields=*`)
    if (!n || n.status !== 'published') return {}
    return pageMetadata({
      title: n.title,
      description: plainText(n.excerpt || n.content, 160) || undefined,
      path: `/news/${id}`,
      image: n.image ? `/cms-assets/${n.image}` : undefined,
      ogType: 'article',
    })
  } catch {
    return {}
  }
}

const CATEGORY_COLOR: Record<string, { bg: string; color: string }> = {
  Announcement: { bg: 'rgba(255,130,26,.15)', color: 'var(--orange)' },
  Event:        { bg: 'rgba(42,167,255,.15)', color: 'var(--sky)' },
  Update:       { bg: 'rgba(47,207,127,.15)', color: 'var(--green)' },
  Press:        { bg: 'rgba(125,92,255,.15)', color: 'var(--purple)' },
}
const CATEGORY_ICON: Record<string, string> = {
  Announcement: '📢', Event: '📅', Update: '🔔', Press: '📰',
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let article: any
  try {
    const n = await directusFetch(`/items/news/${encodeURIComponent(id)}?fields=*`)
    article = {
      ...n,
      text: n.title,
      published: n.status === 'published',
      image: fileUrl(n.image),
    }
  } catch {
    notFound()
  }

  if (!article || article.published === false) notFound()

  // Related news — other published items, excluding current
  const allNews = await getNewsItems()
  const related = allNews
    .filter((n: any) => n.id !== article.id && n.published !== false)
    .slice(0, 3)

  const cat      = article.category || 'Announcement'
  const clr      = CATEGORY_COLOR[cat] || CATEGORY_COLOR.Announcement
  const imageUrl = article.image && typeof article.image === 'object' ? article.image.url : null

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    datePublished: article.date || undefined,
    image: imageUrl ? [`${SITE_URL}${imageUrl}`] : undefined,
    mainEntityOfPage: `${SITE_URL}/news/${article.id}`,
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/verbivore-logo.png` } },
    author: { '@type': 'Organization', name: SITE_NAME },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleJsonLd) }} />
      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/news">News</Link> <span>›</span>
            <span style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block', verticalAlign: 'bottom' }}>
              {article.text}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 14px', borderRadius: 999,
              background: clr.bg, color: clr.color,
              fontSize: 12, fontWeight: 900,
            }}>
              {CATEGORY_ICON[cat]} {cat}
            </span>
            {article.date && (
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 700 }}>
                {article.date}
              </span>
            )}
          </div>

          <h1 style={{ maxWidth: 740 }}>{article.text}</h1>
          {article.excerpt && (
            <p style={{ maxWidth: 620, marginTop: 12, opacity: 0.88 }}>{article.excerpt}</p>
          )}
        </div>
      </section>

      {/* ── ARTICLE BODY ──────────────────────────────────── */}
      <section>
        <div className="container" style={{ paddingBottom: 72 }}>
          <div style={{ maxWidth: 780, margin: '0 auto' }}>

            {/* Featured image */}
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={article.text}
                style={{
                  width: '100%', borderRadius: 20, marginBottom: 40,
                  boxShadow: 'var(--shadow)',
                  aspectRatio: '16/9', objectFit: 'cover',
                }}
              />
            )}

            {/* Article content */}
            {article.content ? (
              <div
                style={{ fontSize: 17, lineHeight: 1.85, color: 'var(--ink)' }}
                className="news-article-body"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            ) : (
              <p style={{ color: 'var(--muted)', fontStyle: 'italic', fontSize: 15 }}>
                Full content not available for this item.
              </p>
            )}

            {/* Footer row */}
            <div style={{
              marginTop: 52, paddingTop: 28,
              borderTop: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 14,
            }}>
              <Link href="/news" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'var(--navy)', fontWeight: 900, fontSize: 14,
                padding: '10px 18px', borderRadius: 999,
                border: '1px solid var(--line)', background: '#fff',
              }}>
                ← All news
              </Link>

              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 999,
                background: clr.bg, color: clr.color,
                fontSize: 12, fontWeight: 900,
              }}>
                {CATEGORY_ICON[cat]} {cat}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── RELATED NEWS ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="section-soft" style={{ paddingBottom: 72 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 28 }}>
              <div>
                <div className="kicker">More news</div>
                <h2 className="section-title">Other announcements.</h2>
              </div>
            </div>
            <div className="desk-only">
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
                gap: 20,
              }}>
                {related.map((item: any) => {
                  const rCat = item.category || 'Announcement'
                  const rClr = CATEGORY_COLOR[rCat] || CATEGORY_COLOR.Announcement
                  const rImg = item.image && typeof item.image === 'object' ? item.image.url : null

                  return (
                    <Link key={item.id} href={`/news/${item.id}`} className="news-related-link">
                      <article className="news-related-card">
                        {rImg && (
                          <div style={{
                            width: '100%', height: 160,
                            background: `url('${rImg}') center/cover no-repeat`,
                          }} />
                        )}
                        <div style={{ padding: '18px 20px 20px' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                            <span style={{
                              fontSize: 11, fontWeight: 900, padding: '3px 10px',
                              borderRadius: 999, background: rClr.bg, color: rClr.color,
                            }}>
                              {CATEGORY_ICON[rCat]} {rCat}
                            </span>
                            {item.date && (
                              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
                                {item.date}
                              </span>
                            )}
                          </div>
                          <h3 style={{
                            fontSize: 15, fontWeight: 900, color: 'var(--navy-2)',
                            lineHeight: 1.4, marginBottom: 6,
                          }}>
                            {item.text}
                          </h3>
                          {item.excerpt && (
                            <p style={{
                              fontSize: 13, color: 'var(--muted)',
                              lineHeight: 1.55,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical' as any,
                              overflow: 'hidden',
                            }}>
                              {item.excerpt}
                            </p>
                          )}
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Mobile: horizontal scroll-snap related news */}
            <div className="mob-only mob-news-scroll">
              {related.map((item: any) => {
                const rCat = item.category || 'Announcement'
                const rClr = CATEGORY_COLOR[rCat] || CATEGORY_COLOR.Announcement
                const rImg = item.image && typeof item.image === 'object' ? item.image.url : null

                return (
                  <Link key={item.id} href={`/news/${item.id}`} className="mob-news-card">
                    {rImg
                      ? <div className="mob-news-thumb" style={{ backgroundImage: `url('${rImg}')` }} />
                      : <div className="mob-news-thumb mob-news-thumb--placeholder" style={{ background: rClr.bg }}><span>{CATEGORY_ICON[rCat]}</span></div>
                    }
                    <div className="mob-news-body">
                      <div className="mob-news-meta">
                        <span className="mob-news-badge" style={{ color: rClr.color, background: rClr.bg }}>{CATEGORY_ICON[rCat]} {rCat}</span>
                        {item.date && <span className="mob-news-date">{item.date}</span>}
                      </div>
                      <h3 className="mob-news-title">{item.text}</h3>
                      {item.excerpt && <p className="mob-news-excerpt">{item.excerpt}</p>}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
