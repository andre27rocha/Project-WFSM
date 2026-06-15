/**
 * Serializes a JSON-LD object to a string safe for use inside a <script> tag.
 * Escapes <, >, and & to prevent script-tag injection while keeping valid JSON.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

type VideoGameInput = {
  name: string
  description: string | null
  developer: string | null
  coverImageUrl: string | null
  slug: string
  siteUrl: string
}

export function videoGameSchema(data: VideoGameInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: data.name,
    ...(data.description ? { description: data.description } : {}),
    ...(data.developer
      ? { developer: { '@type': 'Organization', name: data.developer } }
      : {}),
    ...(data.coverImageUrl ? { image: data.coverImageUrl } : {}),
    url: `${data.siteUrl}/${data.slug}`,
  }
}

type SchemaListItem = { name: string; url: string }

export function itemListSchema(
  name: string,
  url: string,
  listItems: SchemaListItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    url,
    numberOfItems: listItems.length,
    itemListElement: listItems.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  }
}

type FaqItem = { question: string; answer: string }

export function faqPageSchema(url: string, items: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    url,
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

type BreadcrumbItem = { name: string; url?: string }

export function breadcrumbSchema(crumbs: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.url ? { item: crumb.url } : {}),
    })),
  }
}
