export const AVAILABILITY_SCOPES = ['worldwide', 'region', 'country'] as const;

export type AvailabilityScope = (typeof AVAILABILITY_SCOPES)[number];

export const AVAILABILITY_SCOPE_LABELS: Record<AvailabilityScope, string> = {
  worldwide: 'Worldwide',
  region: 'Region',
  country: 'Country',
};

export const REGION_OPTIONS = [
  { value: 'europe', label: 'Europe' },
  { value: 'north-america', label: 'North America' },
  { value: 'south-america', label: 'South America' },
  { value: 'asia', label: 'Asia' },
  { value: 'africa', label: 'Africa' },
  { value: 'oceania', label: 'Oceania' },
  { value: 'middle-east', label: 'Middle East' },
] as const;

const COUNTRY_OPTIONS = [
  ['AR', 'Argentina'], ['AU', 'Australia'], ['AT', 'Austria'], ['BE', 'Belgium'], ['BR', 'Brazil'], ['BG', 'Bulgaria'], ['CA', 'Canada'], ['CL', 'Chile'],
  ['CN', 'China'], ['CO', 'Colombia'], ['HR', 'Croatia'], ['CY', 'Cyprus'], ['CZ', 'Czechia'], ['DK', 'Denmark'], ['EG', 'Egypt'], ['EE', 'Estonia'],
  ['FI', 'Finland'], ['FR', 'France'], ['DE', 'Germany'], ['GR', 'Greece'], ['HK', 'Hong Kong'], ['HU', 'Hungary'], ['IS', 'Iceland'], ['IN', 'India'],
  ['ID', 'Indonesia'], ['IE', 'Ireland'], ['IL', 'Israel'], ['IT', 'Italy'], ['JP', 'Japan'], ['KE', 'Kenya'], ['LV', 'Latvia'], ['LT', 'Lithuania'],
  ['LU', 'Luxembourg'], ['MY', 'Malaysia'], ['MT', 'Malta'], ['MX', 'Mexico'], ['NL', 'Netherlands'], ['NZ', 'New Zealand'], ['NG', 'Nigeria'], ['NO', 'Norway'],
  ['PK', 'Pakistan'], ['PE', 'Peru'], ['PH', 'Philippines'], ['PL', 'Poland'], ['PT', 'Portugal'], ['QA', 'Qatar'], ['RO', 'Romania'], ['SA', 'Saudi Arabia'],
  ['RS', 'Serbia'], ['SG', 'Singapore'], ['SK', 'Slovakia'], ['SI', 'Slovenia'], ['ZA', 'South Africa'], ['KR', 'South Korea'], ['ES', 'Spain'], ['SE', 'Sweden'],
  ['CH', 'Switzerland'], ['TW', 'Taiwan'], ['TH', 'Thailand'], ['TR', 'Turkey'], ['AE', 'United Arab Emirates'], ['GB', 'United Kingdom'], ['US', 'United States'], ['VN', 'Vietnam'],
] as const;

export const COUNTRY_SELECT_OPTIONS = COUNTRY_OPTIONS.map(([value, label]) => ({ value, label }));

const REGION_LABELS = new Map<string, string>(REGION_OPTIONS.map((region) => [region.value, region.label]));
const COUNTRY_LABELS = new Map<string, string>(COUNTRY_SELECT_OPTIONS.map((country) => [country.value, country.label]));

export function getAvailabilityLabel(input: {
  availabilityScope: AvailabilityScope;
  availabilityRegion?: string | null;
  availabilityCountryCode?: string | null;
}) {
  if (input.availabilityScope === 'worldwide') {
    return 'Worldwide';
  }

  if (input.availabilityScope === 'region') {
    return REGION_LABELS.get(input.availabilityRegion ?? '') ?? 'Region';
  }

  return COUNTRY_LABELS.get(input.availabilityCountryCode ?? '') ?? input.availabilityCountryCode ?? 'Country';
}

export function normalizeCountryCode(value: string | null | undefined) {
  const cleaned = value?.trim().toUpperCase();
  return cleaned && COUNTRY_LABELS.has(cleaned) ? cleaned : null;
}

export function normalizeRegion(value: string | null | undefined) {
  const cleaned = value?.trim().toLowerCase();
  return cleaned && REGION_LABELS.has(cleaned) ? cleaned : null;
}
