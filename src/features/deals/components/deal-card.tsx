import Link from 'next/link';
import { Bookmark, MessageSquare, Store, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PublicDeal } from '@/features/deals/types';

function formatPrice(value: number | null, currencyCode: string) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

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

type DealCardProps = {
  deal: PublicDeal;
};

export function DealCard({ deal }: DealCardProps) {
  const salePrice = formatPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatPrice(deal.original_price, deal.currency_code);
  const hasPricing = Boolean(salePrice || originalPrice || deal.discount_percent !== null);

  return (
    <article className="rounded-2xl border border-primary/20 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-[#0f1630]/90 p-3 shadow-[0_0_40px_rgba(59,130,246,0.06)] transition-colors hover:border-primary/40">
      <div className="flex gap-4">
        <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-800/70">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={deal.title} className="h-full w-full object-cover" src={deal.image_url} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800/80 text-xs text-muted-foreground">No image</div>
          )}

          {deal.discount_percent !== null ? (
            <span className="absolute bottom-2 right-2 rounded-md bg-emerald-600/90 px-2 py-1 text-base font-semibold text-white">-{deal.discount_percent}%</span>
          ) : null}

          {hasPricing ? (
            <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-slate-950/85 px-2 py-1.5 text-sm">
              {salePrice ? <span className="font-semibold text-emerald-300">{salePrice}</span> : <span className="font-semibold text-foreground">See deal</span>}
              {originalPrice ? <span className="text-xs text-slate-300 line-through">{originalPrice}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link className="line-clamp-1 text-2xl font-semibold leading-tight text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
                {deal.title}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {deal.deal_types?.name ? (
                  <span className="rounded-md bg-rose-500/80 px-2 py-1 font-semibold uppercase tracking-wide text-white">{deal.deal_types.name}</span>
                ) : null}
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {deal.comments_count}
                </span>
              </div>
            </div>

            <Button aria-label="Save deal" className="shrink-0 border border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground" size="icon" variant="ghost">
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Store className="h-3.5 w-3.5" />
              {deal.stores?.name ?? 'Unknown store'}
            </span>
            <span>•</span>
            <span>{deal.categories?.name ?? 'General'}</span>
            <span>•</span>
            <span>{formatRelativeTime(deal.created_at)}</span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-slate-300">{deal.description?.trim() || 'Brief description of the deal goes here for preview.'}</p>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-3.5 w-3.5" />
                {deal.score}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {deal.comments_count}
              </span>
            </div>

            <Link
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              href={deal.deal_url}
              rel="noreferrer"
              target="_blank"
            >
              See Deal
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
