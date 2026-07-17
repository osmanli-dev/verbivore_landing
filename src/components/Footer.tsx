import Link from "next/link"
import Image from "next/image"
import { getSiteSettings } from "@/lib/globals"

export default async function Footer() {
  const ss = await getSiteSettings()

  const linkGroups = [
    {
      title: "Verbivore",
      links: [
        { href: "/verbivore/about", label: "About" },
        { href: "/verbivore/categories", label: "Categories" },
        { href: "/verbivore/regulations", label: "Regulations" },
        ...(ss.showScientificCommittee !== false
          ? [{ href: "/verbivore/scientific-committee", label: "Scientific Committee" }]
          : []),
        { href: "/verbivore/sample-questions", label: "Sample Questions" },
      ],
    },
    {
      title: "Participate",
      links: [
        { href: "/verbivore/countries-territories", label: "Countries & Territories" },
        { href: "/verbivore/exam-time", label: "Exam Time" },
        { href: "/verbivore/preliminary-round", label: "Preliminary Round" },
        { href: "/verbivore/national-final", label: "National Final" },
        { href: "/verbivore/global-final", label: "Global Final" },
      ],
    },
    {
      title: "Info",
      links: [
        { href: "/editions", label: "Editions" },
        { href: "/faq", label: "FAQ" },
        { href: "/contact", label: "Contact" },
        { href: "/certificate-verify", label: "Verify Certificate" },
      ],
    },
  ]

  return (
    <footer className="footer">
      <div className="container">
        {/* ── Desktop: unchanged 4-column grid ─────────────── */}
        <div className="footer-grid desk-only">
          <div>
            <Image src="/verbivore-logo.png" alt="Verbivore" width={205} height={56} />
            <p>{ss.footerDescription}</p>
          </div>
          {linkGroups.map((g) => (
            <div key={g.title}>
              <h4>{g.title}</h4>
              {g.links.map((l) => (
                <Link key={l.href} href={l.href}>{l.label}</Link>
              ))}
            </div>
          ))}
        </div>

        {/* ── Mobile: brand block + collapsible link accordion ── */}
        <div className="mob-only footer-mob">
          <div className="footer-mob-brand">
            <Image src="/verbivore-logo.png" alt="Verbivore" width={160} height={44} />
            <p>{ss.footerDescription}</p>
          </div>
          <div className="footer-acc">
            {linkGroups.map((g) => (
              <div key={g.title} className="footer-acc-item">
                <button className="footer-acc-header">
                  {g.title}
                  <span className="footer-acc-arrow">+</span>
                </button>
                <div className="footer-acc-body">
                  {g.links.map((l) => (
                    <Link key={l.href} href={l.href}>{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} {ss.footerCopyright}</span>
          <span className="footer-credit">
            Developed by{' '}
            <a href="https://greph.scientra.one" target="_blank" rel="noopener noreferrer">Nicat Osmanlı</a>
            <span className="credit-sep">·</span>
            <a href="https://scientra.one" target="_blank" rel="noopener noreferrer">Scientra One</a>
          </span>
          <span>{ss.contactEmail}</span>
        </div>
      </div>
    </footer>
  )
}
