import Link from 'next/link';

import { toggleSaveFromFeedAction, voteOnDealFromFeedAction } from '@/features/deals/actions';
import { DealCard } from '@/features/deals/components/deal-card';
import type { DealFeedFilters, DealSortOption, PublicDeal } from '@/features/deals/types';

type DealFeedListProps = {
  deals: PublicDeal[];
  hasMore: boolean;
  nextCursor: string | null;
  sort: DealSortOption;
  filters: DealFeedFilters;
};

function buildNextPageLink({
  cursor,
  sort,
  filters,
}: {
  cursor: string;
  sort: DealSortOption;
  filters: DealFeedFilters;
}) {
  const params = new URLSearchParams();

  params.set('sort', sort);
  params.set('cursor', cursor);

  if (filters.category) params.set('category', filters.category);
  if (filters.store) params.set('store', filters.store);
  if (filters.dealType) params.set('dealType', filters.dealType);

  return `/?${params.toString()}`;
}

export function DealFeedList({ deals, hasMore, nextCursor, sort, filters }: DealFeedListProps) {
  if (!deals.length) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground">
        No deals found for this filter combination.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {deals.map((deal) => (
        <DealCard deal={deal} key={deal.id} saveAction={toggleSaveFromFeedAction} voteAction={voteOnDealFromFeedAction} />
      ))}

      {hasMore && nextCursor ? (
        <div className="flex justify-center pt-2">
          <Link className="rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80" href={buildNextPageLink({ cursor: nextCursor, sort, filters })}>
            Load more
          </Link>
        </div>
      ) : null}
    </section>
  );
}
