import Link from 'next/link';
import { Bookmark, MessageSquare, Store, ThumbsDown, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PublicDeal } from '@/features/deals/types';

import { DealValueDisplay } from './deal-value-display';


function formatRelativeTime(dateIso: string) {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const createdAt = new Date(dateIso).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((createdAt - now) / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
}

function formatExpiry(expiresAt: string | null) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtMs = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtMs)) {
    return null;
  }

  const diffDays = Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Expired';
  }

  if (diffDays === 1) {
    return 'Expires in 1 day';
  }

  return `Expires in ${diffDays} days`;
}

type DealCardProps = {
  deal: PublicDeal;
};

export function DealCard({ deal }: DealCardProps) {
  const expiryLabel = formatExpiry(deal.expires_at);

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/40">
      <div className="flex">
        <div className="relative h-44 w-64 shrink-0 overflow-hidden border-r border-border/60 bg-secondary/50">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={deal.title} className="h-full w-full object-cover" src={deal.image_url} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/70 text-xs text-muted-foreground">No image</div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link className="line-clamp-1 text-lg font-semibold leading-tight text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
                  {deal.title}
                </Link>
                {expiryLabel ? (
                  <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-300">{expiryLabel}</span>
                ) : null}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Store className="h-3 w-3" />
                  {deal.stores?.name ?? 'Unknown store'}
                </span>
                <span>•</span>
                <span>{deal.categories?.name ?? 'General'}</span>
                {deal.deal_types?.name ? (
                  <>
                    <span>•</span>
                    <span className="rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[11px] text-primary">{deal.deal_types.name}</span>
                  </>
                ) : null}
                <span>•</span>
                <span>{formatRelativeTime(deal.created_at)}</span>
              </div>
            </div>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-snug text-muted-foreground">{deal.description?.trim() || 'Brief description of the deal goes here for preview.'}</p>

          <div className="mt-4">
            <DealValueDisplay deal={deal} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border/60 px-4 py-2.5">
        <div className="flex items-center gap-2.5 text-emerald-600">
          <button aria-label="Upvote deal" className="inline-flex items-center rounded-md p-1 transition-colors hover:bg-emerald-500/15">
            <ThumbsUp className="h-4 w-4" />
          </button>
          <span className="text-base font-semibold">{deal.score}</span>
          <button aria-label="Downvote deal" className="inline-flex items-center rounded-md p-1 text-rose-500 transition-colors hover:bg-rose-500/15">
            <ThumbsDown className="h-4 w-4" />
          </button>
          <span className="ml-4 inline-flex items-center gap-1.5 text-muted-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-sm">{deal.comments_count}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button aria-label="Save deal" className="h-9 w-9 shrink-0 border border-border bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground" size="icon" variant="ghost">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Link
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            href={deal.deal_url}
            rel="noreferrer"
            target="_blank"
          >
            See Deal
          </Link>
        </div>
      </div>
    </article>
  );
}
