import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDashboardOverviewData } from '@/features/dashboard/queries';
import { DashboardPageHeader, DashboardStatCard, DealStatusBadge, EmptyState, formatRelativeDate } from '@/features/dashboard/components/dashboard-shared';
import { PointsTotalDisplay } from '@/features/points/components/points-total-display';
import { getUserIdentity } from '@/features/profile/queries';
import { requireUser } from '@/lib/auth/session';

export default async function DashboardPage() {
  const user = await requireUser();
  const [data, identity] = await Promise.all([getDashboardOverviewData(user.id), getUserIdentity(user.id)]);
  const fullNameFromMetadata = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '';
  const displayNameFromMetadata = typeof user.user_metadata?.name === 'string' ? user.user_metadata.name.trim() : '';
  const identityDisplayName = identity?.displayName || fullNameFromMetadata || displayNameFromMetadata || user.email || 'User';
  const identityAvatarUrl = identity?.avatarUrl ?? (typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null);

  return (
    <div className="space-y-3">
      <DashboardPageHeader
        description="Your recent activity, submissions, and quick actions in one place."
        identity={{
          displayName: identityDisplayName,
          avatarUrl: identityAvatarUrl,
          subtitle: user.email ?? 'Current account',
        }}
        title="Overview"
      />

      <section>
        <PointsTotalDisplay
          className="max-w-sm"
          context="Your current reputation balance across deals and engagement."
          points={identity?.pointsTotal ?? 0}
          variant="highlight"
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <DashboardStatCard hint="Total deals you posted" label="Submitted" value={data.stats.submittedDeals} />
        <DashboardStatCard hint="Live on public feed" label="Approved" value={data.stats.approvedDeals} />
        <DashboardStatCard hint="Awaiting moderation" label="Pending" value={data.stats.pendingDeals} />
        <DashboardStatCard hint="Deals bookmarked by you" label="Saved" value={data.stats.savedDeals} />
        <DashboardStatCard hint="Comments added by you" label="Comments" value={data.stats.commentsPosted} />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <Card className="border-border/70 bg-card/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-xs">
            <Link className="rounded-md border border-border/70 px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard/submit-deal">
              Submit a new deal
            </Link>
            <Link className="rounded-md border border-border/70 px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard/my-deals">
              Review my submissions
            </Link>
            <Link className="rounded-md border border-border/70 px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard/saved">
              Open saved deals
            </Link>
            <Link className="rounded-md border border-border/70 px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard/activity">
              Check comment activity
            </Link>
            <Link className="rounded-md border border-border/70 px-3 py-2 hover:bg-accent hover:text-accent-foreground" href="/dashboard/settings">
              Manage account settings
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60 lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Recent submissions</CardTitle>
            <Link className="text-xs text-muted-foreground hover:text-foreground" href="/dashboard/my-deals">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentDeals.length ? (
              <div className="space-y-2">
                {data.recentDeals.map((deal) => (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-card/80 px-3 py-2" key={deal.id}>
                    <div className="min-w-0 flex-1">
                      <Link className="block truncate text-sm font-medium hover:underline" href={`/deals/${deal.slug}`}>
                        {deal.title}
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{formatRelativeDate(deal.created_at)}</p>
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <DealStatusBadge status={deal.moderation_status} />
                      <span className="text-xs text-muted-foreground">{deal.score} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState ctaHref="/dashboard/submit-deal" ctaLabel="Submit your first deal" description="Start sharing a deal to see moderation status and engagement here." title="No submissions yet" />
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Recently saved</CardTitle>
            <Link className="text-xs text-muted-foreground hover:text-foreground" href="/dashboard/saved">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentSavedDeals.length ? (
              <div className="space-y-2">
                {data.recentSavedDeals.map((deal) => (
                  <div className="rounded-md border border-border/70 bg-card/80 px-3 py-2" key={`${deal.id}-${deal.bookmarked_at}`}>
                    <Link className="block truncate text-sm font-medium hover:underline" href={`/deals/${deal.slug}`}>
                      {deal.title}
                    </Link>
                    <p className="text-[11px] text-muted-foreground">Saved {formatRelativeDate(deal.bookmarked_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState ctaHref="/" ctaLabel="Browse public feed" description="Saved deals appear here for quick access." title="No saved deals yet" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/70 bg-card/60">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Recent comments</CardTitle>
            <Link className="text-xs text-muted-foreground hover:text-foreground" href="/dashboard/activity">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentComments.length ? (
              <div className="space-y-2">
                {data.recentComments.map((comment) => (
                  <div className="rounded-md border border-border/70 bg-card/80 px-3 py-2" key={comment.id}>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{comment.body}</p>
                    {comment.deal ? (
                      <Link className="mt-1 block truncate text-sm font-medium hover:underline" href={`/deals/${comment.deal.slug}`}>
                        {comment.deal.title}
                      </Link>
                    ) : null}
                    <p className="text-[11px] text-muted-foreground">{formatRelativeDate(comment.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState description="Your recent comment activity will appear here." title="No recent comments" />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
