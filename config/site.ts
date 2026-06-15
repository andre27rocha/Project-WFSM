export const siteConfig = {
  name: 'VaniaCodex',
  description: 'The wiki for metroidvania and soulsvania games.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vaniacodex.com',
  domain: 'vaniacodex.com',
  ogImage: '/og-default.png',

  nav: {
    main: [
      { label: 'Games', href: '/' },
      { label: 'Tier Lists', href: '/tierlist' },
      { label: 'Releases', href: '/releases' },
      { label: 'Beginner Guide', href: '/beginner-guide' },
    ],
  },

  social: {
    github: 'https://github.com/vaniacodex',
  },

  admin: {
    cookieName: 'vc_admin_session',
    sessionMaxAgeSeconds: 60 * 60 * 8,
  },
} as const

export type SiteConfig = typeof siteConfig
