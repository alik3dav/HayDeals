'use client';

import { useState, useTransition } from 'react';

import { loadMoreDealsFromFeedAction, toggleSaveFromFeedAction, voteOnDealFromFeedAction } from '@/features/deals/actions';
import { DealCard } from '@/features/deals/components/deal-card';
import { Button } from '@/components/ui/button';
import type { DealFeedFilters, DealSortOption, PublicDeal } from '@/features/deals/types';

type DealFeedListProps = {
  deals: PublicDeal[];
  hasMore: boolean;
  nextCursor: string | null;
  sort: DealSortOption;
  filters: DealFeedFilters;
};

export function DealFeedList({ deals, hasMore, nextCursor, sort, filters }: DealFeedListProps) {
  const [items, setItems] = useState(deals);
  const [feedCursor, setFeedCursor] = useState(nextCursor);
  const [canLoadMore, setCanLoadMore] = useState(hasMore);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [isLoadingMore, startLoadingMore] = useTransition();

  const handleLoadMore = () => {
    if (!feedCursor || isLoadingMore) {
      return;
    }

    startLoadingMore(async () => {
      try {
        setLoadMoreError(null);
        const response = await loadMoreDealsFromFeedAction({ sort, filters, cursor: feedCursor });

        setItems((currentItems) => {
          const existingIds = new Set(currentItems.map((deal) => deal.id));
          const deduplicatedNewDeals = response.items.filter((deal) => !existingIds.has(deal.id));
          return deduplicatedNewDeals.length > 0 ? [...currentItems, ...deduplicatedNewDeals] : currentItems;
        });

        setCanLoadMore(response.hasMore);
        setFeedCursor(response.nextCursor);
      } catch {
        setLoadMoreError('Unable to load more deals right now. Please try again.');
      }
    });
  };

  if (!items.length) {
    return (
      <div className="rounded-xl border border-border/70 bg-card/60 px-4 py-8 text-center text-sm text-muted-foreground">
        No deals found for this filter combination.
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {items.map((deal) => (
        <DealCard deal={deal} key={deal.id} saveAction={toggleSaveFromFeedAction} voteAction={voteOnDealFromFeedAction} />
      ))}

      {loadMoreError ? <p className="text-center text-sm text-destructive">{loadMoreError}</p> : null}

      {canLoadMore && feedCursor ? (
        <div className="flex justify-center pt-2">
          <Button disabled={isLoadingMore} onClick={handleLoadMore} type="button" variant="secondary">
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      ) : null}

      {isLoadingMore ? (
        <div className="space-y-3" aria-hidden="true">
          {Array.from({ length: 2 }).map((_, index) => (
            <div className="h-44 animate-pulse rounded-2xl border border-border/70 bg-card/60" key={`deal-feed-skeleton-${index}`} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
