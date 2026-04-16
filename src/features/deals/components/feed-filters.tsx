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

function getOptionLabel(items: { label: string; value: string }[], value?: string) {
  if (!value) return 'All';
  return items.find((item) => item.value === value)?.label ?? value;
}

export function FeedFilters({ sort, filters, facets }: FeedFiltersProps) {
  const categoryOptions = optionList('categories', facets.categories);
  const storeOptions = optionList('stores', facets.stores);
  const dealTypeOptions = optionList('deal types', facets.dealTypes);
  const availabilityScopeOptions = [
    { label: 'All availability', value: '' },
    { label: 'Worldwide', value: 'worldwide' },
    { label: 'Region', value: 'region' },
    { label: 'Country', value: 'country' },
  ];
  const regionOptions = [{ label: 'All regions', value: '' }, ...facets.availabilityRegions];
  const countryOptions = [{ label: 'All countries', value: '' }, ...facets.availabilityCountries];

  const filtersWithSort = (patch: Partial<DealFeedFilters>) =>
    buildFeedUrl({
      sort,
      filters: {
        ...filters,
        ...patch,
      },
    });

  const filterMenus: {
    name: string;
    activeValue: string;
    options: { label: string; value: string }[];
    apply: (value: string) => string;
  }[] = [
    {
      name: 'Category',
      activeValue: getOptionLabel(categoryOptions, filters.category),
      options: categoryOptions,
      apply: (value) => filtersWithSort({ category: value || undefined }),
    },
    {
      name: 'Store',
      activeValue: getOptionLabel(storeOptions, filters.store),
      options: storeOptions,
      apply: (value) => filtersWithSort({ store: value || undefined }),
    },
    {
      name: 'Deal type',
      activeValue: getOptionLabel(dealTypeOptions, filters.dealType),
      options: dealTypeOptions,
      apply: (value) => filtersWithSort({ dealType: value || undefined }),
    },
    {
      name: 'Availability',
      activeValue: getOptionLabel(availabilityScopeOptions, filters.availabilityScope),
      options: availabilityScopeOptions,
      apply: (value) => filtersWithSort({ availabilityScope: value || undefined }),
    },
    {
      name: 'Region',
      activeValue: getOptionLabel(regionOptions, filters.availabilityRegion),
      options: regionOptions,
      apply: (value) => filtersWithSort({ availabilityRegion: value || undefined }),
    },
    {
      name: 'Country',
      activeValue: getOptionLabel(countryOptions, filters.availabilityCountry),
      options: countryOptions,
      apply: (value) => filtersWithSort({ availabilityCountry: value || undefined }),
    },
  ];

  return (
    <section className="rounded-xl border border-border/70 bg-card/80 p-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filterMenus.map((menu) => (
          <details className="group relative shrink-0" key={menu.name}>
            <summary className="list-none cursor-pointer rounded-full border border-border/70 bg-secondary/60 px-3 py-1 text-xs text-foreground transition hover:bg-secondary">
              <span className="font-medium">{menu.name}:</span> {menu.activeValue}
            </summary>
            <div className="absolute left-0 z-20 mt-2 max-h-72 min-w-52 overflow-auto rounded-lg border border-border/70 bg-popover p-1 shadow-lg">
              {menu.options.map((option) => (
                <Link
                  className="block rounded-md px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  href={menu.apply(option.value)}
                  key={`${menu.name}-${option.value || 'all'}`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </details>
        ))}

        <Link
          className="shrink-0 rounded-full border border-border/70 bg-secondary px-3 py-1 text-xs text-secondary-foreground"
          href={buildFeedUrl({ sort, filters: {} })}
        >
          Reset
        </Link>
      </div>
    </section>
  );
}
