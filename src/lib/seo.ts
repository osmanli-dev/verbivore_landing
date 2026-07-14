import type { Metadata } from 'next'

/** Canonical origin for the site. Other domains (verbivore-thecontest.com
 *  etc.) serve the same content; canonical URLs always point here so search
 *  engines don't see duplicate content. */
export const SITE_URL = process.env.SITE_URL || 'https://verbivore.org'
export const SITE_NAME = 'Verbivore The Contest'
export const DEFAULT_DESCRIPTION =
  'Verbivore is the international English olympiad for school students aged 9–17. Vocabulary, reading, logic and communication tested across 35+ countries in three competitive rounds.'
export const DEFAULT_OG_IMAGE = '/verbivore-logo.png'

/** Strips HTML tags and squeezes whitespace, clamped for meta descriptions. */
export function plainText(html: string | null | undefined, max = 160): string {
  if (!html) return ''
  const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim()
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
  image,
  ogType = 'website',
}: {
  title: string
  description?: string
  path: string
  image?: string | null
  ogType?: 'website' | 'article'
}): Metadata {
  const url = `${SITE_URL}${path}`
  const img = image || DEFAULT_OG_IMAGE
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: ogType,
      locale: 'en_US',
      images: [{ url: img }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [img],
    },
  }
}

/** Serialized JSON-LD for a <script type="application/ld+json"> block. */
export function jsonLd(data: object | object[]): string {
  return JSON.stringify(data)
}

export const ORGANIZATION_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/verbivore-logo.png`,
  sameAs: ['https://verbivore-thecontest.com', 'https://verbivore-thecontest.org'],
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'info@verbivore.org',
    contactType: 'customer support',
  },
}

export const WEBSITE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: 'en',
}
