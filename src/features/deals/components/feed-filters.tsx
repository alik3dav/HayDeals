'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';

import { buildFeedUrl } from '@/features/deals/components/feed-filter-utils';
import type { DealFeedFilters, DealSortOption, FeedFacetCollections } from '@/features/deals/types';

type FeedFiltersProps = {
  sort: DealSortOption;
  filters: DealFeedFilters;
  facets: FeedFacetCollections;
};
type AvailabilityScopeOptionValue = NonNullable<DealFeedFilters['availabilityScope']>;

function optionList(baseLabel: string, items: { label: string; value: string }[]) {
  return [{ label: `All ${baseLabel}`, value: '' }, ...items];
}

function getOptionLabel(items: { label: string; value: string }[], value?: string) {
  if (!value) return 'All';
  return items.find((item) => item.value === value)?.label ?? value;
}

export function FeedFilters({ sort, filters, facets }: FeedFiltersProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  const dealTypeOptions = optionList('deal types', facets.dealTypes);
  const availabilityScopeOptions: { label: string; value: '' | AvailabilityScopeOptionValue }[] = [
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
    selectedValue?: string;
    activeValue: string;
    options: { label: string; value: string }[];
    apply: (value: string) => string;
  }[] = [
    {
      name: 'Deal type',
      selectedValue: filters.dealType,
      activeValue: getOptionLabel(dealTypeOptions, filters.dealType),
      options: dealTypeOptions,
      apply: (value) => filtersWithSort({ dealType: value || undefined }),
    },
    {
      name: 'Availability',
      selectedValue: filters.availabilityScope,
      activeValue: getOptionLabel(availabilityScopeOptions, filters.availabilityScope),
      options: availabilityScopeOptions,
      apply: (value) =>
        filtersWithSort({
          availabilityScope: value ? (value as AvailabilityScopeOptionValue) : undefined,
        }),
    },
    {
      name: 'Region',
      selectedValue: filters.availabilityRegion,
      activeValue: getOptionLabel(regionOptions, filters.availabilityRegion),
      options: regionOptions,
      apply: (value) => filtersWithSort({ availabilityRegion: value || undefined }),
    },
    {
      name: 'Country',
      selectedValue: filters.availabilityCountry,
      activeValue: getOptionLabel(countryOptions, filters.availabilityCountry),
      options: countryOptions,
      apply: (value) => filtersWithSort({ availabilityCountry: value || undefined }),
    },
  ];

  return (
    <section
      className="relative z-30 overflow-visible"
      ref={containerRef}
    >
      <div className="flex flex-wrap items-center gap-2">
        {filterMenus.map((menu) => (
          <div className="relative shrink-0" key={menu.name}>
            <button
              aria-haspopup="menu"
              aria-expanded={openMenu === menu.name}
              className={`rounded-full border px-4 py-2.5 pr-9 text-xs text-foreground transition ${
                menu.selectedValue
                  ? 'border-primary/30 bg-primary/10 hover:bg-primary/15'
                  : 'border-border/70 bg-secondary hover:bg-secondary/90'
              }`}
              onClick={() => {
                setOpenMenu((current) => (current === menu.name ? null : menu.name));
              }}
              type="button"
            >
              {menu.selectedValue ? menu.activeValue : menu.name}
            </button>
            {menu.selectedValue ? (
              <Link
                aria-label={`Remove ${menu.name} filter`}
                className="absolute right-3 top-1/2 flex size-4 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/20 hover:text-foreground"
                href={menu.apply('')}
                onClick={() => setOpenMenu(null)}
              >
                <X aria-hidden="true" className="size-3" />
              </Link>
            ) : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <ChevronDown className="size-3" />
              </span>
            )}
            <div
              className={`absolute left-0 z-50 mt-2 max-h-72 min-w-52 overflow-auto rounded-lg border border-border/80 bg-background p-1 shadow-lg transition ${
                openMenu === menu.name
                  ? 'visible opacity-100'
                  : 'pointer-events-none invisible opacity-0'
              }`}
            >
              {menu.options.map((option) => (
                <Link
                  className="block rounded-md px-3 py-1.5 text-xs text-popover-foreground hover:bg-accent hover:text-accent-foreground"
                  href={menu.apply(option.value)}
                  key={`${menu.name}-${option.value || 'all'}`}
                  onClick={() => setOpenMenu(null)}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
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
