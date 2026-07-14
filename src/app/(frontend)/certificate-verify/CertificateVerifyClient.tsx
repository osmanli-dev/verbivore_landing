'use client'
import { useState } from 'react'
import Link from 'next/link'
type CertResult = {
  name: string; country: string; grade: string; date: string;
  score: string; achievement: string; type: string
}

export default function CertificateVerifyPage() {
  const [code, setCode] = useState('')
  const [result, setResult] = useState<CertResult | null | 'not-found'>(null)
  const [loading, setLoading] = useState(false)

  const verify = async () => {
    const trimmed = code.trim().toUpperCase()
    if (!trimmed) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`/api/verify-certificate?code=${encodeURIComponent(trimmed)}`)
      const data = await res.json()
      setResult(data.found ? data : 'not-found')
    } catch {
      setResult('not-found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="verify-section" style={{ padding: '76px 0' }}>
        <div className="container">
          <div className="verify-wrap">
            <div className="verify-icon">🎓</div>
            <h2>Certificate Verification</h2>
            <p>Enter the unique certificate code printed on your Verbivore certificate to verify its authenticity.</p>
            <div className="verify-input-row">
              <input
                type="text"
                className="verify-code"
                placeholder="VERB-2026-AZ-001"
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verify()}
              />
              <button className="btn btn-primary" onClick={verify} disabled={loading}>
                {loading ? 'Checking…' : 'Verify →'}
              </button>
            </div>
            <p className="verify-hint">Format: VERB-YEAR-CC-### &nbsp;·&nbsp; Codes are printed on official certificates.</p>

            {result === 'not-found' && (
              <div className="verify-result invalid" style={{ display: 'block' }}>
                <div className="verify-badge fail">✗ &nbsp;Certificate Not Found</div>
                <p className="verify-invalid-msg">The code <b>{code.toUpperCase()}</b> could not be found in our records.<br />Please check the code and try again.</p>
              </div>
            )}
            {result && result !== 'not-found' && (
              <div className="verify-result valid" style={{ display: 'block' }}>
                <div className="verify-badge ok">✓ &nbsp;Verified Certificate</div>
                <div className="desk-only">
                  <div className="verify-grid">
                    {[
                      ['Full Name', result.name],
                      ['Country', result.country],
                      ['Grade', `Grade ${result.grade}`],
                      ['Exam Date', result.date],
                      ['Score', result.score],
                      ['Achievement', result.achievement],
                      ['Exam Type', result.type],
                      ['Certificate Code', code.toUpperCase()],
                    ].map(([label, val]) => (
                      <div key={label} className="verify-field">
                        <label>{label}</label>
                        <span>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: single-column "ticket" layout */}
                <div className="mob-only mob-cert-list">
                  {[
                    ['Full Name', result.name],
                    ['Country', result.country],
                    ['Grade', `Grade ${result.grade}`],
                    ['Exam Date', result.date],
                    ['Score', result.score],
                    ['Achievement', result.achievement],
                    ['Exam Type', result.type],
                    ['Certificate Code', code.toUpperCase()],
                  ].map(([label, val]) => (
                    <div key={label} className="mob-cert-row">
                      <label>{label}</label>
                      <span>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted)', fontSize: 14 }}>
            <Link href="/">← Back to Home</Link>
          </p>
        </div>
      </section>
    </>
  )
}
