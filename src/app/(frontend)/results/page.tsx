import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'

export const metadata = pageMetadata({ title: "Results", description: "Official Verbivore results by stage and country: download Preliminary Round and National Final result PDFs.", path: "/results" })

const ROUNDS = [
  {
    icon: '🟠',
    stage: 'Preliminary Round',
    stageAz: 'İlkin Seçim',
    desc: 'Ölkə üzrə ilkin seçim mərhələsinin nəticələri. Hər ölkə üçün PDF nəticə sənədi.',
    href: '/verbivore/preliminary-round#results',
    color: '#ff821a',
    bg: 'rgba(255,130,26,.08)',
    border: 'rgba(255,130,26,.25)',
    label: 'İlkin seçim nəticələri →',
  },
  {
    icon: '🔵',
    stage: 'National Final',
    stageAz: 'Milli Final',
    desc: 'Milli final mərhələsinin ölkə üzrə nəticələri. Grand Finala keçənlər burada elan olunur.',
    href: '/verbivore/national-final#results',
    color: '#2aa7ff',
    bg: 'rgba(42,167,255,.08)',
    border: 'rgba(42,167,255,.25)',
    label: 'Milli final nəticələri →',
  },
  {
    icon: '🏆',
    stage: 'Grand Final',
    stageAz: 'Böyük Final',
    desc: 'Grand Final medal cədvəli, ölkə nümayəndəlikləri və fərdi nəticələr.',
    href: '/editions/results',
    color: '#7d5cff',
    bg: 'rgba(125,92,255,.08)',
    border: 'rgba(125,92,255,.25)',
    label: 'Grand Final nəticələri →',
  },
]

export default function ResultsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <span>Results</span>
          </div>
          <h1>Nəticələr</h1>
          <p>Hansı mərhələnin nəticəsini görmək istəyirsiniz? Aşağıdan seçim edin.</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="desk-only">
            <div className="results-choice-grid">
              {ROUNDS.map((r) => (
                <Link key={r.stage} href={r.href} className="results-choice-card" style={{ '--rc-color': r.color, '--rc-bg': r.bg, '--rc-border': r.border } as React.CSSProperties}>
                  <div className="results-choice-icon">{r.icon}</div>
                  <div className="results-choice-body">
                    <span className="results-choice-stage">{r.stage}</span>
                    <h2 className="results-choice-title">{r.stageAz}</h2>
                    <p className="results-choice-desc">{r.desc}</p>
                  </div>
                  <span className="results-choice-cta">{r.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile: compact navigation rows */}
          <div className="mob-only mob-choice-list">
            {ROUNDS.map((r) => (
              <Link key={r.stage} href={r.href} className="mob-choice-row" style={{ '--rc-color': r.color, '--rc-bg': r.bg, '--rc-border': r.border } as React.CSSProperties}>
                <div className="mob-choice-icon">{r.icon}</div>
                <div className="mob-choice-body">
                  <span className="mob-choice-stage">{r.stage}</span>
                  <h2 className="mob-choice-title">{r.stageAz}</h2>
                  <p className="mob-choice-desc">{r.desc}</p>
                </div>
                <span className="mob-choice-chevron">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
