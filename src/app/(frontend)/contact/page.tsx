import { pageMetadata } from '@/lib/seo'
import Link from "next/link"
import { getSiteSettings, getContactPage } from "@/lib/globals"
import ContactForm from "./ContactForm"

export const dynamic = "force-dynamic"
export const metadata = pageMetadata({ title: "Contact Us", description: "Reach the Verbivore coordination team for questions about participation, accreditation or partnerships.", path: "/contact" })

export default async function ContactPage() {
  const [cp, ss] = await Promise.all([
    getContactPage(),
    getSiteSettings(),
  ])

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>&#x203a;</span> <span>{cp.heroTitle}</span>
          </div>
          <h1>{cp.heroTitle}</h1>
          <p>{cp.heroSubtitle}</p>
        </div>
      </section>

      <section>
        <div className="container">
          {/* Mobile: tappable contact rows above the form */}
          <div className="mob-only mob-contact-list" style={{ marginBottom: 16 }}>
            {([
              ['📧', 'Email', ss.contactEmail, ss.contactEmail ? `mailto:${ss.contactEmail}` : null],
              ['🌍', 'International Coordination', ss.representativesEmail, ss.representativesEmail ? `mailto:${ss.representativesEmail}` : null],
              ['🤝', 'Partnerships', ss.partnersEmail, ss.partnersEmail ? `mailto:${ss.partnersEmail}` : null],
            ] as [string, string, string | undefined, string | null][]).filter(([, , v]) => v).map(([icon, label, val, href]) => (
              href ? (
                <a key={label} className="mob-contact-row" href={href}>
                  <div className="mob-contact-icon">{icon}</div>
                  <div><div className="mob-contact-label">{label}</div><div className="mob-contact-value">{val}</div></div>
                </a>
              ) : (
                <div key={label} className="mob-contact-row">
                  <div className="mob-contact-icon">{icon}</div>
                  <div><div className="mob-contact-label">{label}</div><div className="mob-contact-value">{val}</div></div>
                </div>
              )
            ))}
          </div>

          <div className="two-col">
            <div className="panel">
              <ContactForm
                formTitle={cp.formTitle}
                formSuccessMessage={cp.formSuccessMessage}
              />
            </div>
            <div className="desk-only">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="panel">
                  <h3>&#x1f4e7; Email</h3>
                  <p style={{ color: "var(--muted)", marginTop: 6 }}>{ss.contactEmail}</p>
                </div>
                <div className="panel">
                  <h3>&#x1f30d; International Coordination</h3>
                  <p style={{ color: "var(--muted)", marginTop: 6 }}>{ss.representativesDescription}</p>
                  <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>{ss.representativesEmail}</p>
                </div>
                <div className="panel">
                  <h3>&#x1f91d; Partnerships</h3>
                  <p style={{ color: "var(--muted)", marginTop: 6 }}>{ss.partnersDescription}</p>
                  <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 14 }}>{ss.partnersEmail}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
