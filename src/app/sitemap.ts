import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { getNewsItems, getEditions, getCategories } from '@/lib/globals'

export const dynamic = 'force-dynamic'

const STATIC_PATHS: Array<[path: string, priority: number]> = [
  ['', 1],
  ['/verbivore', 0.9],
  ['/verbivore/about', 0.9],
  ['/verbivore/categories', 0.8],
  ['/verbivore/countries-territories', 0.8],
  ['/verbivore/exam-time', 0.8],
  ['/verbivore/global-final', 0.8],
  ['/verbivore/national-final', 0.8],
  ['/verbivore/preliminary-round', 0.8],
  ['/verbivore/regulations', 0.7],
  ['/verbivore/sample-questions', 0.8],
  ['/verbivore/scientific-committee', 0.6],
  ['/editions', 0.8],
  ['/editions/results', 0.7],
  ['/results', 0.7],
  ['/news', 0.9],
  ['/faq', 0.7],
  ['/contact', 0.6],
  ['/certificate-verify', 0.5],
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, editions, categories] = await Promise.all([
    getNewsItems(),
    getEditions(),
    getCategories(),
  ])

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map(([path, priority]) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === '' || path === '/news' ? 'daily' : 'weekly',
    priority,
  }))

  for (const n of news) {
    if (n.published === false) continue
    entries.push({
      url: `${SITE_URL}/news/${n.id}`,
      lastModified: n.date ? new Date(n.date) : undefined,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  for (const ed of editions) {
    if (!ed.slug) continue
    for (const sub of ['', '/schedule', '/participants', '/organizer', '/rules']) {
      entries.push({
        url: `${SITE_URL}/editions/${ed.slug}${sub}`,
        changeFrequency: 'weekly',
        priority: sub === '' ? 0.8 : 0.6,
      })
    }
  }

  for (const cat of categories) {
    if (!cat.slug) continue
    entries.push({
      url: `${SITE_URL}/verbivore/categories/${cat.slug}`,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
