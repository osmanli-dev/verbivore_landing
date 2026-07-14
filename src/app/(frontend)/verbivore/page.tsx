import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
export const metadata = pageMetadata({ title: "Verbivore Contest \u2014 Structure, Rounds & Participation", description: "How the Verbivore English olympiad works: three rounds from the school-level Preliminary to the international Grand Final, age categories, and how to take part.", path: "/verbivore" })

const PAGES = [
  { href: '/verbivore/about', icon: '📖', title: 'About', desc: 'What Verbivore is, its mission and history.' },
  { href: '/verbivore/categories', icon: '🎯', title: 'Categories', desc: 'Junior A, Junior B, Intermediate, Senior.' },
  { href: '/verbivore/regulations', icon: '📋', title: 'Regulations', desc: 'Official rules and eligibility criteria.' },
  { href: '/verbivore/countries-territories', icon: '🌍', title: 'Countries', desc: 'All participating countries and representatives.' },
  { href: '/verbivore/scientific-committee', icon: '👥', title: 'Committee', desc: 'International Scientific Committee members.' },
  { href: '/verbivore/sample-questions', icon: '📝', title: 'Sample Questions', desc: 'Preview exam-style questions by category.' },
  { href: '/verbivore/preliminary-round', icon: '1️⃣', title: 'Preliminary Round', desc: 'First country-based selection round.' },
  { href: '/verbivore/national-final', icon: '2️⃣', title: 'National Final', desc: 'In-country final for top scorers.' },
  { href: '/verbivore/global-final', icon: '3️⃣', title: 'Grand Final', desc: 'International championship event.' },
  { href: '/verbivore/exam-time', icon: '📅', title: 'Exam Time', desc: 'Country-based exam calendar and dates.' },
]

export default function VerbivoreIndexPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb"><Link href="/">Home</Link> <span>›</span> <span>Verbivore</span></div>
          <h1>Verbivore — The Contest</h1>
          <p>Everything you need to know about the international English olympiad for school students.</p>
        </div>
      </section>
      <section>
        <div className="container">
          <div className="desk-only">
            <div className="card-grid">
              {PAGES.map((p, i) => (
                <article key={p.href} className={`info-card reveal reveal-delay-${(i % 3) + 1}`}>
                  <div>
                    <div className="icon">{p.icon}</div>
                    <h3>{p.title}</h3>
                    <p>{p.desc}</p>
                  </div>
                  <Link className="card-link" href={p.href}>Open →</Link>
                </article>
              ))}
            </div>
          </div>
          <div className="mob-only mob-quicklink-grid">
            {PAGES.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className={`mob-quicklink-tile${p.href === '/verbivore/about' || p.href === '/verbivore/categories' ? ' featured' : ''}`}
              >
                <div className="mob-quicklink-icon">{p.icon}</div>
                <div>
                  <div className="mob-quicklink-title">{p.title}</div>
                  <div className="mob-quicklink-desc">{p.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
