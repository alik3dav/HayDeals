import Link from 'next/link';

import type { DealFeedFilters, DealSortOption, FeedFacetCollections } from '@/features/deals/types';

export const sortOptions: { label: string; value: DealSortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Hot', value: 'hot' },
  { label: 'Most discussed', value: 'discussed' },
];

type FeedFiltersProps = {
  sort: DealSortOption;
  filters: DealFeedFilters;
  facets: FeedFacetCollections;
};

export function buildFeedUrl({
  sort,
  filters,
}: {
  sort: DealSortOption;
  filters: DealFeedFilters;
}) {
  const params = new URLSearchParams();

  params.set('sort', sort);

  if (filters.query) params.set('q', filters.query);
  if (filters.category) params.set('category', filters.category);
  if (filters.store) params.set('store', filters.store);
  if (filters.dealType) params.set('dealType', filters.dealType);
  if (filters.availabilityScope) params.set('availabilityScope', filters.availabilityScope);
  if (filters.availabilityRegion) params.set('availabilityRegion', filters.availabilityRegion);
  if (filters.availabilityCountry) params.set('availabilityCountry', filters.availabilityCountry);

  return `/?${params.toString()}`;
}

function optionList(baseLabel: string, items: { label: string; value: string }[]) {
  return [{ label: `All ${baseLabel}`, value: '' }, ...items];
}

export function FeedFilters({ sort, filters, facets }: FeedFiltersProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-card/80 p-3">
      <form className="grid gap-2 md:grid-cols-3" method="get">
        <input name="sort" type="hidden" value={sort} />
        <input name="q" type="hidden" value={filters.query ?? ''} />

        <label className="text-xs text-muted-foreground">
          Category
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.category ?? ''}
            name="category"
          >
            {optionList('categories', facets.categories).map((option) => (
              <option key={`category-${option.value || 'all'}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Store
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.store ?? ''}
            name="store"
          >
            {optionList('stores', facets.stores).map((option) => (
              <option key={`store-${option.value || 'all'}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Deal type
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.dealType ?? ''}
            name="dealType"
          >
            {optionList('deal types', facets.dealTypes).map((option) => (
              <option key={`deal-type-${option.value || 'all'}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Availability type
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.availabilityScope ?? ''}
            name="availabilityScope"
          >
            <option value="">All availability</option>
            <option value="worldwide">Worldwide</option>
            <option value="region">Region</option>
            <option value="country">Country</option>
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Region
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.availabilityRegion ?? ''}
            name="availabilityRegion"
          >
            <option value="">All regions</option>
            {facets.availabilityRegions.map((option) => (
              <option key={`availability-region-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-xs text-muted-foreground">
          Country
          <select
            className="mt-1 w-full rounded-md border border-border/70 bg-secondary/50 px-2 py-2 text-sm text-foreground"
            defaultValue={filters.availabilityCountry ?? ''}
            name="availabilityCountry"
          >
            <option value="">All countries</option>
            {facets.availabilityCountries.map((option) => (
              <option key={`availability-country-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-3 flex gap-2">
          <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground" type="submit">
            Apply filters
          </button>
          <Link className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground" href={buildFeedUrl({ sort, filters: {} })}>
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}
