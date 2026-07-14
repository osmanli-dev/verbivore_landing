import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getAboutPage } from '@/lib/globals'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "About Verbivore", description: "The international English olympiad for school students aged 9-17, run with schools and national educational bodies across 35+ countries.", path: "/verbivore/about" })

const DEFAULT_MISSION_CARDS = [
  { icon: '🎯', title: 'Skill-based', text: 'Test real English ability, not rote memorisation.' },
  { icon: '🌍', title: 'International', text: 'Connect students across 35+ countries.' },
  { icon: '📈', title: 'Motivating', text: 'Inspire through recognition and achievement.' },
  { icon: '🏫', title: 'School-friendly', text: 'Easy for schools and representatives to run.' },
]

const DEFAULT_TIMELINE = [
  { year: '2023', text: 'Verbivore founded. First pilot edition with 3 countries.' },
  { year: '2024', text: 'First full edition. 18 countries, 3,000+ students.' },
  { year: '2025', text: '28 countries. National Finals introduced.' },
  { year: '2026', text: 'Grand Final in London, UK. 35+ countries.' },
]

const DEFAULT_TOPICS = ['Vocabulary', 'Reading Comprehension', 'Grammar in Context', 'Logical Reasoning', 'Short Writing', 'Word Formation', 'Idioms & Phrases', 'Text Coherence']

export default async function AboutPage() {
  const ap = await getAboutPage()

  const missionCards = ap.missionCards?.length > 0 ? ap.missionCards : DEFAULT_MISSION_CARDS
  const timeline     = ap.timelineItems?.length  > 0 ? ap.timelineItems  : DEFAULT_TIMELINE
  const topics       = ap.examTopics?.length     > 0 ? ap.examTopics.map((t: any) => t.label) : DEFAULT_TOPICS

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/verbivore">Verbivore</Link> <span>›</span>
            <span>About</span>
          </div>
          <h1>{ap.heroTitle}</h1>
          <p>{ap.heroSubtitle}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="two-col" style={{ gap: 32 }}>
            <div>
              <div className="panel">
                <h2>{ap.whatIsTitle}</h2>
                <p style={{ marginTop: 12 }}>{ap.whatIsText1}</p>
                <p style={{ marginTop: 10 }}>{ap.whatIsText2}</p>
              </div>
              <div className="panel" style={{ marginTop: 20 }}>
                <h2>{ap.missionTitle}</h2>
                <div className="desk-only">
                  <div className="card-grid" style={{ marginTop: 16 }}>
                    {missionCards.map((v: any) => (
                      <div key={v.title} className="value-card">
                        <div className="value-icon">{v.icon}</div>
                        <h3>{v.title}</h3>
                        <p>{v.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mob-only mob-value-row">
                  {missionCards.map((v: any) => (
                    <div key={v.title} className="value-card">
                      <div className="value-icon">{v.icon}</div>
                      <h3>{v.title}</h3>
                      <p>{v.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="panel">
                <h3>🗓 Timeline</h3>
                <div className="desk-only">
                  <div className="timeline-story" style={{ marginTop: 14 }}>
                    {timeline.map((item: any) => (
                      <div key={item.year} className="timeline-story-item">
                        <div className="ts-dot"></div>
                        <div className="ts-content">
                          <h4>{item.year}</h4>
                          <p>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mob-only mob-stepper" style={{ marginTop: 14 }}>
                  {timeline.map((item: any) => (
                    <div key={item.year} className="mob-stepper-item">
                      <div className="mob-stepper-node">{String(item.year).slice(-2)}</div>
                      <div className="mob-stepper-body">
                        <strong>{item.year}</strong>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>📊 Exam Topics</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {topics.map((t: string) => (
                    <span key={t} className="cat-topic-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="panel">
                <h3>🌐 Participate</h3>
                <p style={{ marginTop: 8, color: 'var(--muted)' }}>{ap.participateText}</p>
                <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                  <Link className="btn btn-primary" href="/verbivore/countries-territories">View Countries →</Link>
                  <Link className="btn btn-ghost" href="/contact">Contact Us</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
