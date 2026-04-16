import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import type { DealDetail } from '@/features/deal-details/types';
import { formatRelativeTime } from '@/features/deal-details/components/deal-utils';
import { FormattedText } from '@/components/ui/formatted-text';
import { PublicProfileLink } from '@/features/profile/components/public-profile-link';
import { buildProfileDisplayName } from '@/features/profile/identity';

export function DealHeader({ deal }: { deal: DealDetail }) {
  const authorName = buildProfileDisplayName(deal.profiles ?? {}, 'User');

  return (
    <header className="rounded-2xl border border-border/60 bg-card/80 p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold leading-tight text-foreground md:text-2xl">{deal.title}</h1>
          {deal.deal_types?.name ? (
            <span className="shrink-0 rounded border border-primary/30 bg-primary/10 px-2 py-1 text-[11px] text-primary">{deal.deal_types.name}</span>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{deal.stores?.name ?? deal.merchant_name ?? 'Unknown merchant'}</span>
          <span>•</span>
          <span>{deal.categories?.name ?? 'General'}</span>
          <span>•</span>
          <PublicProfileLink className="hover:text-primary" username={deal.profiles?.username}>
            {authorName}
          </PublicProfileLink>
          <span>•</span>
          <span>{formatRelativeTime(deal.created_at)}</span>
        </div>

        {deal.description ? <FormattedText className="max-w-none" content={deal.description} /> : null}

        <Link className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" href={deal.deal_url} rel="noreferrer" target="_blank">
          Visit deal <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
