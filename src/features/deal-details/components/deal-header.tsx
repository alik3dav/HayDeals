import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import type { DealDetail } from '@/features/deal-details/types';
import { formatRelativeTime } from '@/features/deal-details/components/deal-utils';

export function DealHeader({ deal }: { deal: DealDetail }) {
  return (
    <header className="overflow-hidden rounded-2xl border border-border/60 bg-card/80">
      <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4 p-5">
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
            <span>{formatRelativeTime(deal.created_at)}</span>
          </div>

          {deal.description ? <p className="text-sm leading-relaxed text-muted-foreground">{deal.description}</p> : null}

          <Link className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline" href={deal.deal_url} rel="noreferrer" target="_blank">
            Visit deal <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="relative aspect-square border-t border-border/60 bg-secondary/50 md:aspect-auto md:h-80 md:w-80 md:justify-self-end md:border-l md:border-t-0">
          {deal.image_url ? (
            <Image
              alt={`Deal image for ${deal.title}`}
              className="object-cover"
              fill
              loading="eager"
              priority
              sizes="(max-width: 768px) 100vw, 320px"
              src={deal.image_url}
            />
          ) : (
            <div className="flex h-full min-h-48 items-center justify-center px-4 text-xs text-muted-foreground">No deal image provided</div>
          )}
        </div>
      </div>
    </header>
  );
}
