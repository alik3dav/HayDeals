import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://cipideals.com';
const DEFAULT_LANGUAGE_TAG = 'en';

export const SITE_NAME = 'CipiDeals';
export const SITE_DESCRIPTION = 'CipiDeals is a community-powered deals feed to discover, vote on, and share verified offers.';

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;
}

export function getDefaultLanguageTag() {
  return process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE_TAG ?? DEFAULT_LANGUAGE_TAG;
}

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, getSiteUrl()).toString();
}

export function buildPageDescription(description?: string | null, fallback?: string) {
  const normalized = description?.trim();

  if (!normalized) {
    return fallback ?? SITE_DESCRIPTION;
  }

  return normalized.slice(0, 160);
}

export function getOptionalDealLocationLabel(
  location?: {
    country?: string | null;
    region?: string | null;
    city?: string | null;
  } | null,
) {
  if (!location) {
    return null;
  }

  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
}

export function buildPageMetadata({
  title,
  description,
  pathname,
  noIndex = false,
}: {
  title: string;
  description: string;
  pathname: string;
  noIndex?: boolean;
}): Metadata {
  const canonical = absoluteUrl(pathname);
  const languageTag = getDefaultLanguageTag();
  const normalizedDescription = buildPageDescription(description);

  return {
    title,
    description: normalizedDescription,
    alternates: {
      canonical,
      languages: {
        [languageTag]: canonical,
        'x-default': canonical,
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description: normalizedDescription,
      url: canonical,
      locale: languageTag,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: normalizedDescription,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
