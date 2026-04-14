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
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/40 md:flex md:min-h-56">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden border-b border-border/60 bg-secondary/50 md:h-56 md:w-56 md:border-b-0 md:border-r">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={deal.title} className="h-full w-full object-cover" src={deal.image_url} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/70 text-xs text-muted-foreground">No image</div>
          )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 gap-2">
      
          
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
              {expiryLabel ? <span className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-300">{expiryLabel}</span> : null}
            </div>
          
              <Link className="line-clamp-1 text-lg font-semibold leading-tight text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
                {deal.title}
              </Link>
              
            
           
     

        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{deal.description?.trim() || 'Brief description of the deal goes here for preview.'}</p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0 text-left">
            <DealValueDisplay deal={deal} />
          </div>
          <div className="w-full rounded-xl border border-sky-400/20 bg-[#061835] px-3 py-2.5 text-[#d6e6ff]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center overflow-hidden rounded-lg border border-cyan-400/40 bg-[#071b3a] text-xs">
                <span className="inline-flex items-center px-3 py-1.5 font-semibold uppercase tracking-[0.16em] text-cyan-300">
                  {deal.coupon_code?.trim() || 'No Code'}
                </span>
                <button
                  aria-label="Copy coupon code"
                  className="border-l border-cyan-400/30 px-2.5 py-1.5 text-cyan-100 transition-colors hover:bg-cyan-500/15"
                  type="button"
                >
                  Copy
                </button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-sky-300/5 px-3 py-1.5 text-sm">
                  <button aria-label="Upvote deal" className="inline-flex items-center rounded-full p-1 text-sky-100 transition-colors hover:bg-sky-400/20">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <span className="min-w-6 text-center text-base font-semibold text-white">{deal.score}</span>
                  <button aria-label="Downvote deal" className="inline-flex items-center rounded-full p-1 text-sky-100 transition-colors hover:bg-sky-400/20">
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>

                <span className="inline-flex items-center gap-1.5 text-sm text-sky-100/90">
                  <MessageSquare className="h-4 w-4" />
                  <span>{deal.comments_count}</span>
                </span>

                <Button
                  aria-label="Save deal"
                  className="h-8 w-8 shrink-0 rounded-md border border-sky-300/25 bg-sky-400/10 text-sky-100 hover:bg-sky-400/20 hover:text-white"
                  size="icon"
                  variant="ghost"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>

                <Link
                  className="inline-flex items-center rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-white/90"
                  href={deal.deal_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  See Deal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
