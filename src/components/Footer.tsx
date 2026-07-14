import Link from "next/link"
import Image from "next/image"
import { getSiteSettings } from "@/lib/globals"

export default async function Footer() {
  const ss = await getSiteSettings()

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Image src="/verbivore-logo.png" alt="Verbivore" width={205} height={56} />
            <p>{ss.footerDescription}</p>
          </div>
          <div>
            <h4>Verbivore</h4>
            <Link href="/verbivore/about">About</Link>
            <Link href="/verbivore/categories">Categories</Link>
            <Link href="/verbivore/regulations">Regulations</Link>
            {ss.showScientificCommittee !== false && (
              <Link href="/verbivore/scientific-committee">Scientific Committee</Link>
            )}
            <Link href="/verbivore/sample-questions">Sample Questions</Link>
          </div>
          <div>
            <h4>Participate</h4>
            <Link href="/verbivore/countries-territories">Countries &amp; Territories</Link>
            <Link href="/verbivore/exam-time">Exam Time</Link>
            <Link href="/verbivore/preliminary-round">Preliminary Round</Link>
            <Link href="/verbivore/national-final">National Final</Link>
            <Link href="/verbivore/global-final">Global Final</Link>
          </div>
          <div>
            <h4>Info</h4>
            <Link href="/editions">Editions</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/certificate-verify">Verify Certificate</Link>
            <Link href="/admin" style={{ opacity: 0.5, fontSize: 12 }}>Admin</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} {ss.footerCopyright}</span>
          <span>
            <strong>
              Developed by{" "}
              <a
                href="https://scientra.one/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline", margin: 0, color: "#fff" }}
              >
                Nicat Osmanlı
              </a>
            </strong>
          </span>
          <span>{ss.contactEmail}</span>
        </div>
      </div>
    </footer>
  )
}
