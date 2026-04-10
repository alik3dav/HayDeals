import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import type { DealDetail } from '@/features/deal-details/types';
import { formatRelativeTime } from '@/features/deal-details/components/deal-utils';

export function DealHeader({ deal }: { deal: DealDetail }) {
  return (
    <header className="space-y-3 rounded-lg border border-border/60 bg-card/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-lg font-semibold leading-tight text-foreground">{deal.title}</h1>
        {deal.deal_types?.name ? <span className="rounded border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary">{deal.deal_types.name}</span> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{deal.stores?.name ?? deal.merchant_name ?? 'Unknown merchant'}</span>
        <span>•</span>
        <span>{deal.categories?.name ?? 'General'}</span>
        <span>•</span>
        <span>{formatRelativeTime(deal.created_at)}</span>
      </div>

      {deal.description ? <p className="text-sm text-muted-foreground">{deal.description}</p> : null}

      <Link className="inline-flex items-center gap-1 text-xs text-primary hover:underline" href={deal.deal_url} rel="noreferrer" target="_blank">
        Visit deal <ExternalLink className="h-3.5 w-3.5" />
      </Link>
    </header>
  );
}
