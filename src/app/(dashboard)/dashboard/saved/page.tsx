import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardPageHeader, EmptyState, formatRelativeDate } from '@/features/dashboard/components/dashboard-shared';
import { getSavedDeals } from '@/features/dashboard/queries';
import { requireUser } from '@/lib/auth/session';

export default async function SavedDealsPage() {
  const user = await requireUser();
  const deals = await getSavedDeals(user.id);

  return (
    <div className="space-y-3">
      <DashboardPageHeader title="Saved deals" description="Quick access to the deals you bookmarked from the public feed." />

      {deals.length ? (
        <div className="space-y-2">
          {deals.map((deal) => (
            <Card className="border-border/70 bg-card/60" key={`${deal.id}-${deal.bookmarked_at}`}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link className="block truncate text-sm font-semibold hover:underline" href={`/deals/${deal.id}`}>
                    {deal.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">Saved {formatRelativeDate(deal.bookmarked_at)}</p>
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">{deal.score} pts</span>
                  <span className="rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">{deal.comments_count} comments</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState ctaHref="/" ctaLabel="Explore deals" description="Bookmark deals from the feed and they will appear here." title="Nothing saved yet" />
      )}
    </div>
  );
}
