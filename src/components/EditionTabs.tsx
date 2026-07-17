import Link from 'next/link'

const TABS = [
  { key: 'about',        label: 'About' },
  { key: 'organizer',    label: 'Organizer' },
  { key: 'schedule',     label: 'Schedule' },
  { key: 'rules',        label: 'Rules' },
  { key: 'participants', label: 'Participants' },
  { key: 'results',      label: 'Results' },
]

export function EditionTabs({ slug, active }: { slug: string; active: string }) {
  return (
    <div className="tabs-list">
      {TABS.map(tab => {
        const href = tab.key === 'about'   ? `/editions/${slug}`
                   : tab.key === 'results' ? '/editions/results'
                   : `/editions/${slug}/${tab.key}`
        return (
          <Link key={tab.key} href={href} className={active === tab.key ? 'active' : undefined}>
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
