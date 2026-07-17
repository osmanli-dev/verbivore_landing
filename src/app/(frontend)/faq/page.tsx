import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getFaqItems } from '@/lib/globals'
import { jsonLd, plainText } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Frequently Asked Questions", description: "Answers to common questions about Verbivore participation, registration, exams, results and the Grand Final.", path: "/faq" })

const GROUPS = ['Students & Parents', 'Schools & Educators', 'Grand Final & Editions']

export default async function FAQPage() {
  const docs = await getFaqItems()

  const byGroup = GROUPS.map((g) => ({
    group: g,
    items: docs.filter((d) => d.group === g),
  }))
  const firstActiveIdx = byGroup.findIndex((g) => g.items.length > 0)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: docs.map((d: any) => ({
      '@type': 'Question',
      name: d.question,
      acceptedAnswer: { '@type': 'Answer', text: plainText(d.answer, 500) },
    })),
  }

  return (
    <>
      {docs.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }} />
      )}
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> <span>›</span> <span>FAQ</span></div>
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Verbivore participation, registration, exams and the Grand Final.</p>
        </div>
      </section>

      <section>
        <div className="container">
          {/* Mobile category switcher — real tab-panel behaviour on
              mobile (see .faq-group / .mob-faq-active in globals.css);
              desktop ignores it entirely and shows every group at once. */}
          <div className="mob-only mob-reg-jumps mob-faq-jumps" aria-label="FAQ categories">
            {byGroup.map(({ group, items }, gi) => items.length > 0 && (
              <button
                key={group}
                className={`mob-reg-jump${gi === firstActiveIdx ? ' active' : ''}`}
                data-reg-id={`faq-${gi}`}
                aria-current={gi === firstActiveIdx ? 'true' : undefined}
              >
                {group}
              </button>
            ))}
          </div>

          <div className="two-col" style={{ gap: 32 }}>
            <div>
              {byGroup.map(({ group, items }, gi) => items.length > 0 && (
                <div
                  key={group}
                  id={`reg-faq-${gi}`}
                  className={`faq-group${gi === firstActiveIdx ? ' mob-faq-active' : ''}`}
                >
                  <h2 className="faq-group-title">{group}</h2>
                  <div className="faq-list">
                    {items.map((item) => (
                      <div key={item.id} className="faq-item">
                        <button className="faq-q">
                          {item.question}
                          <span>+</span>
                        </button>
                        <div className="faq-a" dangerouslySetInnerHTML={{ __html: item.answer }} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="faq-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 16, alignSelf: 'flex-start', position: 'sticky', top: 100 }}>
              <div className="panel desk-only">
                <h3>📚 Categories</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {GROUPS.map((g) => (
                    <span key={g} style={{ color: 'var(--muted)', fontWeight: 800, fontSize: 14 }}>• {g}</span>
                  ))}
                </div>
              </div>
              <div className="panel desk-only">
                <h3>❓ Still have questions?</h3>
                <p style={{ marginTop: 8 }}>Contact our coordination team directly.</p>
                <Link className="btn btn-primary" href="/contact" style={{ marginTop: 14, display: 'inline-flex' }}>Contact Us →</Link>
              </div>
            </div>
          </div>

          {/* Mobile: "Still have questions?" CTA at the very bottom */}
          <div className="mob-only panel mob-info-panel" style={{ marginTop: 16 }}>
            <h3>❓ Still have questions?</h3>
            <p style={{ marginTop: 8, color: 'var(--muted)' }}>Contact our coordination team directly.</p>
            <Link className="btn btn-primary" href="/contact" style={{ marginTop: 14, display: 'inline-flex' }}>Contact Us →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
