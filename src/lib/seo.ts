import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://cipideals.com';

export const SITE_NAME = 'CipiDeals';
export const SITE_DESCRIPTION = 'Discover and share the best verified deals from the community.';

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL ?? DEFAULT_SITE_URL;
}

export function absoluteUrl(pathname = '/') {
  return new URL(pathname, getSiteUrl()).toString();
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

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
