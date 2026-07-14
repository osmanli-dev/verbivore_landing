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
    title: `${base} - Rules`,
    description: `Competition rules and conduct guidelines for the ${base}.`,
    path: `/editions/${slug}/rules`,
    image: (ed.heroImage as any)?.url ?? (ed.image as any)?.url ?? undefined,
  })
}

export default async function EditionRulesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ed = await getEditionBySlug(slug)
  if (!ed) notFound()

  const docs: any[]     = ed.ruleDocuments || []
  const sections: any[] = ed.ruleSections   || []

  return (
    <>
      <section className="page-hero edition-hero" style={{ background: 'linear-gradient(135deg,#17205a,#222b72)', color: '#fff', paddingBottom: 0 }}>
        <div className="container">
          <div className="breadcrumb" style={{ color: 'rgba(255,255,255,.7)' }}>
            <Link href="/editions" style={{ color: 'rgba(255,255,255,.7)' }}>Editions</Link>
            <span>›</span>
            <Link href={`/editions/${slug}`} style={{ color: 'rgba(255,255,255,.7)' }}>{ed.shortTitle}</Link>
            <span>›</span>
            <span>Rules</span>
          </div>
          <h1 style={{ color: '#fff' }}>{ed.shortTitle} Rules &amp; Documents</h1>
          <p style={{ color: 'rgba(255,255,255,.84)' }}>Official rules, regulations and PDF downloads for the {ed.shortTitle} Grand Final.</p>
          <EditionTabs slug={slug} active="rules" />
        </div>
      </section>

      {docs.length === 0 && sections.length === 0 ? (
        <section>
          <div className="container" style={{ paddingBottom: 80, textAlign: 'center' }}>
            <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>Rules and documents will be published soon.</p>
          </div>
        </section>
      ) : (
        <>
          {/* ── DOCUMENTS ────────────────────────────────── */}
          {docs.length > 0 && (
            <section>
              <div className="container">
                <div className="section-head">
                  <div>
                    <div className="kicker">Official documents</div>
                    <h2 className="section-title reveal">Download the {ed.shortTitle} regulation files.</h2>
                  </div>
                  <p className="section-text reveal reveal-delay-1">All documents are official and binding. Country representatives should distribute these to team leaders and participants.</p>
                </div>
                <div className="two-col reveal desk-only" style={{ marginBottom: 16 }}>
                  {docs.map((doc: any, i: number) => (
                    <article key={i} className="panel" style={i === 0 ? { background: 'linear-gradient(135deg,#fff7ed,#fff)' } : {}}>
                      <div style={{ fontSize: 38, marginBottom: 12 }}>📄</div>
                      <h3>{doc.title}</h3>
                      {doc.description && <p style={{ color: 'var(--muted)', lineHeight: 1.65, marginBottom: 18 }}>{doc.description}</p>}
                      <div className="reg-pdf-row">
                        {doc.downloadUrl ? (
                          <a className="btn btn-primary btn-sm" href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">Download PDF →</a>
                        ) : (
                          <span className="btn btn-ghost btn-sm" style={{ opacity: .6, cursor: 'default' }}>Coming soon</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mob-only mob-pdf-row">
                  {docs.map((doc: any, i: number) => (
                    doc.downloadUrl ? (
                      <a key={i} className="prelim-pdf-item" href={doc.downloadUrl} target="_blank" rel="noopener noreferrer">
                        <span className="prelim-pdf-icon">PDF</span>
                        <span className="prelim-pdf-info">
                          <strong>{doc.title}</strong>
                          <span>Download →</span>
                        </span>
                      </a>
                    ) : (
                      <div key={i} className="prelim-pdf-item" style={{ opacity: .6 }}>
                        <span className="prelim-pdf-icon">PDF</span>
                        <span className="prelim-pdf-info">
                          <strong>{doc.title}</strong>
                          <span>Coming soon</span>
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── ACCORDION ────────────────────────────────── */}
          {sections.length > 0 && (
            <section className="section-soft">
              <div className="container" style={{ paddingBottom: 72 }}>
                <div className="section-head">
                  <div>
                    <div className="kicker">Regulation sections</div>
                    <h2 className="section-title reveal">Expand to read in detail.</h2>
                  </div>
                  <p className="section-text reveal reveal-delay-1">Click any section below to expand the full regulation text.</p>
                </div>
                <div className="reg-list">
                  {sections.map((sec: any, i: number) => (
                    <div key={i} className={`reg-section${i === 0 ? ' open' : ''} reveal${i > 0 ? ` reveal-delay-${i}` : ''}`}>
                      <button className="reg-header" type="button">
                        <div className="reg-header-left">
                          {sec.icon && <div className="reg-icon">{sec.icon}</div>}
                          <span className="reg-title">{sec.title}</span>
                        </div>
                        <span className="reg-arrow">›</span>
                      </button>
                      <div className="reg-body">
                        {sec.content.split('\n').filter((l: string) => l.trim()).map((line: string, li: number) => (
                          <p key={li}>{line.startsWith('•') ? line : `• ${line}`}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}
