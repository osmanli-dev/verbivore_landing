import { pageMetadata } from '@/lib/seo'
import React from 'react'
import Link from 'next/link'
import { getRegulations } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Regulations", description: "Official rules and regulations of the Verbivore English olympiad: eligibility, exam conduct, scoring, appeals and awards.", path: "/verbivore/regulations" })

function formatContent(text: string) {
  const lines = text.split('\n')
  const result: React.ReactElement[] = []
  let listItems: string[] = []

  const flushList = (key: string) => {
    if (listItems.length) {
      result.push(<ul key={`ul-${key}`}>{listItems.map((li, i) => <li key={i}>{li}</li>)}</ul>)
      listItems = []
    }
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('•')) {
      listItems.push(trimmed.slice(1).trim())
    } else {
      flushList(String(idx))
      if (trimmed) result.push(<p key={idx}>{trimmed}</p>)
    }
  })
  flushList('end')
  return result
}

export default async function RegulationsPage() {
  const docs = await getRegulations()

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> <span>›</span> <Link href="/verbivore">Verbivore</Link> <span>›</span> <span>Regulations</span></div>
          <h1>Contest Regulations</h1>
          <p>Official rules, eligibility criteria, exam format and conduct guidelines for all participants, supervisors and national representatives.</p>
        </div>
      </section>

      <section>
        <div className="container">

          {/* Mobile quick-jump pills */}
          <div className="mob-only mob-reg-jumps">
            {docs.map((reg) => (
              <button key={reg.id} className="mob-reg-jump" data-reg-id={reg.id}>{reg.icon || '📋'} {reg.title}</button>
            ))}
          </div>

          <div className="two-col" style={{ gap: 32 }}>
            <div>
              <div className="reg-list">
                {docs.map((reg) => (
                  <div key={reg.id} className="reg-section" id={`reg-${reg.id}`}>
                    <button className="reg-header">
                      <div className="reg-header-left">
                        <div className="reg-icon">{reg.icon || '📋'}</div>
                        <span className="reg-title">{reg.title}</span>
                      </div>
                      <span className="reg-arrow">›</span>
                    </button>
                    <div className="reg-body">
                      {formatContent(reg.content || '')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="reg-sidebar desk-only" style={{ alignSelf: 'flex-start', position: 'sticky', top: 100 }}>
              <div className="panel">
                <h3>📋 Quick Links</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                  {docs.map((reg) => (
                    <span key={reg.id} style={{ color: 'var(--muted)', fontWeight: 800, fontSize: 14 }}>• {reg.title}</span>
                  ))}
                </div>
              </div>
              <div className="panel" style={{ marginTop: 16 }}>
                <h3>❓ Questions?</h3>
                <p style={{ marginTop: 8 }}>Contact your national representative or our coordination team.</p>
                <Link className="btn btn-primary" href="/contact" style={{ marginTop: 14, display: 'inline-flex' }}>Contact Us →</Link>
              </div>
            </div>
          </div>

          {/* Mobile contact CTA */}
          <div className="mob-only" style={{ marginTop: 24 }}>
            <Link className="btn btn-primary" href="/contact" style={{ width: '100%', justifyContent: 'center' }}>Questions? Contact Us →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
