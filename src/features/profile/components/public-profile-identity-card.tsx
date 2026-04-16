import { CalendarDays, MessageSquare, Tag } from 'lucide-react';

import { PointsTotalDisplay } from '@/features/points/components/points-total-display';
import { UserAvatar } from '@/features/profile/components/user-avatar';
import { buildProfileDisplayName } from '@/features/profile/identity';
import type { PublicProfile } from '@/features/profile/public-profile.types';

function formatJoinDate(value: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(new Date(value));
}

export function PublicProfileIdentityCard({ profile }: { profile: PublicProfile }) {
  const displayName = buildProfileDisplayName(profile);

  return (
    <section className="rounded-2xl border border-border/60 bg-card/80 p-6">
      <div className="flex flex-wrap items-start gap-4 sm:items-center">
        <UserAvatar avatarUrl={profile.avatar_url} className="h-16 w-16" fallbackText={displayName} textClassName="text-lg" />

        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="truncate text-2xl font-semibold text-foreground">{displayName}</h1>
          <p className="truncate text-sm text-muted-foreground">@{profile.username}</p>
        </div>
      </div>

      <PointsTotalDisplay className="mt-5" context="Visible reputation based on real account activity." points={profile.points_total} />

      <dl className="mt-3 grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <dt className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground/80">
            <Tag className="h-3.5 w-3.5" /> Deals
          </dt>
          <dd className="text-lg font-semibold text-foreground">{profile.approved_deals_count}</dd>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <dt className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground/80">
            <MessageSquare className="h-3.5 w-3.5" /> Comments
          </dt>
          <dd className="text-lg font-semibold text-foreground">{profile.comments_count}</dd>
        </div>
        <div className="rounded-lg border border-border/50 bg-background/40 p-3">
          <dt className="mb-1 inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground/80">
            <CalendarDays className="h-3.5 w-3.5" /> Joined
          </dt>
          <dd className="text-lg font-semibold text-foreground">{formatJoinDate(profile.created_at)}</dd>
        </div>
      </dl>
    </section>
  );
}
