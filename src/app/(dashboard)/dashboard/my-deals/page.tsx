import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardPageHeader, DealStatusBadge, EmptyState, formatRelativeDate } from '@/features/dashboard/components/dashboard-shared';
import { getMyDeals } from '@/features/dashboard/queries';
import { requireUser } from '@/lib/auth/session';

export default async function MyDealsPage() {
  const user = await requireUser();
  const deals = await getMyDeals(user.id);

  return (
    <div className="space-y-3">
      <DashboardPageHeader title="My deals" description="Track moderation status and engagement on your submitted deals." />

      {deals.length ? (
        <div className="space-y-2">
          {deals.map((deal) => (
            <Card className="border-border/70 bg-card/60" key={deal.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <Link className="block truncate text-sm font-semibold hover:underline" href={`/deals/${deal.id}`}>
                    {deal.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted-foreground">Posted {formatRelativeDate(deal.created_at)}</p>
                </div>
                <div className="inline-flex items-center gap-2">
                  <DealStatusBadge status={deal.moderation_status} />
                  <span className="rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">{deal.score} pts</span>
                  <span className="rounded-md border border-border/70 px-2 py-0.5 text-xs text-muted-foreground">{deal.comments_count} comments</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState ctaHref="/dashboard/submit-deal" ctaLabel="Submit a deal" description="Your submitted deals will be listed here once created." title="No submitted deals" />
      )}
    </div>
  );
}
