import Link from 'next/link';

import { buildFeedUrl, sortOptions } from '@/features/deals/components/feed-filter-utils';
import type { DealFeedFilters, DealSortOption } from '@/features/deals/types';
import { cn } from '@/lib/utils';

type FeedSortSubheaderProps = {
  sort: DealSortOption;
  filters: DealFeedFilters;
};

export function FeedSortSubheader({ sort, filters }: FeedSortSubheaderProps) {
  return (
    <div className="border-b border-border/60 bg-background/95">
      <div className="container flex h-10 items-center gap-2 text-sm">
        {sortOptions.map((option, index) => {
          const isActive = sort === option.value;

          return (
            <div className="flex items-center gap-2" key={option.value}>
              <Link
                className={cn(
                  'relative py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                  isActive && 'text-primary after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-primary',
                )}
                href={buildFeedUrl({ sort: option.value, filters })}
              >
                {option.label}
              </Link>

              {index < sortOptions.length - 1 ? <span className="text-muted-foreground/60">•</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
