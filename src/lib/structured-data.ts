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
  id: 'Programmer web dan spreadsheet',
  en: 'Web and spreadsheet developer',
};

const personDescription: Record<Locale, string> = {
  id: 'Programmer web yang membuat website serta templat dan dashboard Excel/Google Sheets untuk usaha kecil, sekaligus pembuat TakarLaba dan PasalBaru.',
  en: 'A web developer who builds websites for small businesses, along with Excel and Google Sheets templates and dashboards. Maker of TakarLaba and PasalBaru.',
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
    knowsAbout: ['Web development', 'Astro', 'Laravel', 'Next.js', 'TypeScript', 'Microsoft Excel', 'Google Sheets', 'Personal data protection'],
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
