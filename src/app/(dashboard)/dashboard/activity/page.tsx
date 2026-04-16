import Link from 'next/link';

import { Card, CardContent } from '@/components/ui/card';
import { DashboardPageHeader, EmptyState, formatRelativeDate } from '@/features/dashboard/components/dashboard-shared';
import { getActivity } from '@/features/dashboard/queries';
import { requireUser } from '@/lib/auth/session';

export default async function ActivityPage() {
  const user = await requireUser();
  const comments = await getActivity(user.id);

  return (
    <div className="space-y-3">
      <DashboardPageHeader title="Activity" description="Your latest comment activity across deal discussions." />

      {comments.length ? (
        <div className="space-y-2">
          {comments.map((comment) => (
            <Card className="border-border/70 bg-card/60" key={comment.id}>
              <CardContent className="space-y-2 p-3">
                <p className="text-sm text-foreground/90">{comment.body}</p>
                <div className="inline-flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatRelativeDate(comment.created_at)}</span>
                  {comment.deal ? (
                    <Link className="rounded-md border border-border/70 px-2 py-0.5 hover:bg-accent hover:text-accent-foreground" href={`/deals/${comment.deal.slug}`}>
                      {comment.deal.title}
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState description="Join deal discussions and your activity history will show up here." title="No activity yet" />
      )}
    </div>
  );
}
