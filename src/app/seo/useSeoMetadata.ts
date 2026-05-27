import { useEffect } from 'react';
import { getBaseJsonLd, getSeoAlternates, getSeoConstants, getSeoData } from './metadata';
import type { SupportedLocale } from '../i18n/locale';

const BASE_JSON_LD_ID = 'nextdream-jsonld-base';
const PAGE_JSON_LD_ID = 'nextdream-jsonld-page';

function ensureMeta(attribute: 'name' | 'property', key: string): HTMLMetaElement {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  return element;
}

function setMeta(attribute: 'name' | 'property', key: string, value: string): void {
  const element = ensureMeta(attribute, key);
  element.setAttribute('content', value);
}

function setCanonical(url: string): void {
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
}

function setAlternateLinks(alternates: Record<SupportedLocale | 'x-default', string>): void {
  document.head.querySelectorAll('link[data-nextdream-hreflang="true"]').forEach((element) => {
    element.remove();
  });

  for (const [locale, href] of Object.entries(alternates)) {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', locale);
    link.setAttribute('href', href);
    link.setAttribute('data-nextdream-hreflang', 'true');
    document.head.appendChild(link);
  }
}

function setJsonLd(id: string, payload: Record<string, unknown> | null): void {
  const existing = document.getElementById(id);

  if (!payload) {
    if (existing) existing.remove();
    return;
  }

  const script = existing ?? document.createElement('script');
  script.id = id;
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(payload);

  if (!existing) {
    document.head.appendChild(script);
  }
}

function normalizePath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function useSeoMetadata(pathname: string): void {
  useEffect(() => {
    const { siteName, siteUrl, defaultImage } = getSeoConstants();
    const normalizedPath = normalizePath(pathname);
    const seo = getSeoData(normalizedPath);
    const locale = seo.locale ?? 'pt-BR';

    const canonicalPath = seo.canonicalPath && seo.canonicalPath !== '/' ? normalizePath(seo.canonicalPath) : '';
    const canonicalUrl = `${siteUrl}${canonicalPath}`;
    const robots = seo.robots ?? 'index, follow';

    document.title = seo.title;

    setMeta('name', 'description', seo.description);
    setMeta('name', 'robots', robots);

    setCanonical(canonicalUrl);
    setAlternateLinks(getSeoAlternates(normalizedPath));

    setMeta('property', 'og:type', seo.ogType ?? 'website');
    setMeta('property', 'og:locale', locale.replace('-', '_'));
    setMeta('property', 'og:site_name', siteName);
    setMeta('property', 'og:url', canonicalUrl);
    setMeta('property', 'og:title', seo.title);
    setMeta('property', 'og:description', seo.description);
    setMeta('property', 'og:image', defaultImage);
    setMeta('property', 'og:image:alt', 'NextDream - human connections that fulfill dreams');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', seo.title);
    setMeta('name', 'twitter:description', seo.description);
    setMeta('name', 'twitter:image', defaultImage);

    setJsonLd(BASE_JSON_LD_ID, getBaseJsonLd(locale));
    setJsonLd(PAGE_JSON_LD_ID, seo.jsonLd ?? null);
  }, [pathname]);
}
