import { githubUrl, profile } from '../config/profile';
import type { Locale } from '../i18n/routes';

export type WebPageType = 'WebPage' | 'ProfilePage' | 'ContactPage' | 'CollectionPage' | 'AboutPage';

interface PageInfo {
  site: URL;
  canonical: URL;
  locale: Locale;
  title: string;
  description: string;
  type?: WebPageType;
}

const jobTitle: Record<Locale, string> = {
  id: 'Programmer web (sampingan)',
  en: 'Web developer (side work)',
};

const personDescription: Record<Locale, string> = {
  id: 'Mahasiswa Ilmu Hukum di Universitas Terbuka yang baru memulai kerja sampingan sebagai programmer web.',
  en: 'A law student at Universitas Terbuka who has just started doing web development on the side.',
};

/** Data terstruktur schema.org: Person, WebSite, dan halaman yang sedang dibuka. */
export function buildJsonLd({ site, canonical, locale, title, description, type = 'WebPage' }: PageInfo) {
  const personId = new URL('/#tenma', site).href;
  const websiteId = new URL('/#website', site).href;

  const person: Record<string, unknown> = {
    '@type': 'Person',
    '@id': personId,
    name: profile.fullName ?? profile.displayName,
    url: site.href,
    jobTitle: jobTitle[locale],
    description: personDescription[locale],
    affiliation: {
      '@type': 'CollegeOrUniversity',
      name: 'Universitas Terbuka',
      url: 'https://www.ut.ac.id/',
    },
    knowsAbout: ['Web development', 'Astro', 'Laravel', 'Next.js', 'TypeScript', 'Personal data protection'],
    sameAs: [githubUrl],
  };
  if (profile.fullName) person.alternateName = profile.displayName;
  if (profile.email) person.email = `mailto:${profile.email}`;
  if (profile.city) person.address = { '@type': 'PostalAddress', addressLocality: profile.city };

  const website = {
    '@type': 'WebSite',
    '@id': websiteId,
    url: site.href,
    name: profile.displayName,
    inLanguage: ['id', 'en'],
    publisher: { '@id': personId },
  };

  const page: Record<string, unknown> = {
    '@type': type,
    '@id': `${canonical.href}#webpage`,
    url: canonical.href,
    name: title,
    description,
    inLanguage: locale,
    isPartOf: { '@id': websiteId },
    about: { '@id': personId },
  };
  if (type === 'ProfilePage') page.mainEntity = { '@id': personId };

  return { '@context': 'https://schema.org', '@graph': [person, website, page] };
}
