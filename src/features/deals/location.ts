import { COUNTRY_SELECT_OPTIONS, normalizeCountryCode } from '@/features/deals/availability';
import type { DealFeedFilters } from '@/features/deals/types';

const LOCATION_COOKIE_NAME = 'hd_location_country';

const REGION_COUNTRY_CODES: Record<string, readonly string[]> = {
  europe: ['AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IS', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'RS', 'SE', 'SI', 'SK', 'TR'],
  'north-america': ['CA', 'MX', 'US'],
  'south-america': ['AR', 'BR', 'CL', 'CO', 'PE'],
  asia: ['CN', 'HK', 'ID', 'IN', 'JP', 'KR', 'MY', 'PH', 'PK', 'SG', 'TH', 'TW', 'VN'],
  africa: ['EG', 'KE', 'NG', 'ZA'],
  oceania: ['AU', 'NZ'],
  'middle-east': ['AE', 'IL', 'QA', 'SA'],
};

const COUNTRY_LABELS = new Map<string, string>(COUNTRY_SELECT_OPTIONS.map((entry) => [entry.value, entry.label]));
const COUNTRY_TO_REGION = new Map<string, string>(
  Object.entries(REGION_COUNTRY_CODES).flatMap(([region, countries]) => countries.map((countryCode) => [countryCode, region] as const)),
);

const COUNTRY_HEADER_KEYS = ['x-vercel-ip-country', 'cf-ipcountry', 'cloudfront-viewer-country', 'x-country-code', 'x-appengine-country'];

export type DetectedLocation = {
  countryCode: string;
  countryLabel: string;
  region: string | null;
};

export type AvailabilityPriority = {
  countryCode: string;
  region: string | null;
  autoApplied: boolean;
};

export function getLocationCookieName() {
  return LOCATION_COOKIE_NAME;
}

export function detectCountryFromHeaders(headers: Headers): string | null {
  for (const key of COUNTRY_HEADER_KEYS) {
    const normalized = normalizeCountryCode(headers.get(key));
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

export function resolveDetectedLocation({
  headers,
  cookies,
}: {
  headers: Headers;
  cookies?: { get: (name: string) => { value: string } | undefined };
}): DetectedLocation | null {
  const cookieCountry = normalizeCountryCode(cookies?.get(LOCATION_COOKIE_NAME)?.value);
  const detectedCountry = detectCountryFromHeaders(headers);
  const countryCode = detectedCountry ?? cookieCountry;

  if (!countryCode) {
    return null;
  }

  return {
    countryCode,
    countryLabel: COUNTRY_LABELS.get(countryCode) ?? countryCode,
    region: COUNTRY_TO_REGION.get(countryCode) ?? null,
  };
}

export function isManualAvailabilityFilterActive(filters: DealFeedFilters) {
  return Boolean(filters.availabilityScope || filters.availabilityRegion || filters.availabilityCountry);
}

export function getAvailabilityPriority(filters: DealFeedFilters, location: DetectedLocation | null): AvailabilityPriority {
  if (!location || isManualAvailabilityFilterActive(filters)) {
    return {
      countryCode: '',
      region: null,
      autoApplied: false,
    };
  }

  return {
    countryCode: location.countryCode,
    region: location.region,
    autoApplied: true,
  };
}
