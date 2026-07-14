import { pageMetadata } from '@/lib/seo'
import Link from 'next/link'
import { getEditions } from '@/lib/globals'
import { ResultsList } from '@/components/ResultsList'

export const dynamic = 'force-dynamic'
export const metadata = pageMetadata({ title: "Edition Results", description: "Official results of Verbivore Grand Final editions: medal tables, rankings and country performance.", path: "/editions/results" })

export default async function ResultsPage() {
  const editions = await getEditions()
  const withResults = editions.filter((e: any) => e.medalTable && e.medalTable.length > 0)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> <span>›</span>
            <Link href="/editions">Editions</Link> <span>›</span>
            <span>Results</span>
          </div>
          <h1>Results</h1>
          <p>Edition and year-based result tables with medal counts and full student detail view.</p>
        </div>
      </section>

      <section>
        <div className="container" style={{ paddingBottom: 80 }}>
          {withResults.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)', fontSize: 16, fontWeight: 700 }}>
              Results will be published after each Grand Final.
            </div>
          ) : (
            <ResultsList editions={withResults} />
          )}
        </div>
      </section>
    </>
  )
}
