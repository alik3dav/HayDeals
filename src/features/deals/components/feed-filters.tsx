import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { DealFeedFilters, DealSortOption, FeedFacetCollections } from '@/features/deals/types';

const sortOptions: { label: string; value: DealSortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Hot', value: 'hot' },
  { label: 'Most discussed', value: 'discussed' },
];

type FeedFiltersProps = {
  sort: DealSortOption;
  filters: DealFeedFilters;
  facets: FeedFacetCollections;
};

function buildUrl({
  sort,
  filters,
}: {
  sort: DealSortOption;
  filters: DealFeedFilters;
}) {
  const params = new URLSearchParams();

  params.set('sort', sort);

  if (filters.category) params.set('category', filters.category);
  if (filters.store) params.set('store', filters.store);
  if (filters.dealType) params.set('dealType', filters.dealType);

  return `/?${params.toString()}`;
}

function optionList(baseLabel: string, items: { label: string; value: string }[]) {
  return [{ label: `All ${baseLabel}`, value: '' }, ...items];
}

export function FeedFilters({ sort, filters, facets }: FeedFiltersProps) {
  return (
    <section className="space-y-3 rounded-xl border border-border/70 bg-card/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {sortOptions.map((option) => {
          const isActive = sort === option.value;

          return (
            <Link
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                isActive ? 'bg-primary/20 text-primary' : 'bg-secondary/60 text-muted-foreground hover:text-foreground',
              )}
              href={buildUrl({ sort: option.value, filters })}
              key={option.value}
            >
              {option.label}
            </Link>
          );
        })}
      </div>

      <form className="grid gap-2 md:grid-cols-3" method="get">
        <input name="sort" type="hidden" value={sort} />

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

        <div className="md:col-span-3 flex gap-2">
          <button className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground" type="submit">
            Apply filters
          </button>
          <Link className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground" href={buildUrl({ sort, filters: {} })}>
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}
