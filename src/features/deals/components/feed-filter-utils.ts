import type { DealFeedFilters, DealSortOption } from '@/features/deals/types';

export const sortOptions: { label: string; value: DealSortOption }[] = [
  { label: 'Newest', value: 'newest' },
  { label: 'Hot', value: 'hot' },
  { label: 'Most discussed', value: 'discussed' },
];

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
