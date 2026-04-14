import Link from 'next/link';
import { Bookmark, MessageSquare, Store, ThumbsDown, ThumbsUp } from 'lucide-react';

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
  const salePrice = formatPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatPrice(deal.original_price, deal.currency_code);
  const expiryLabel = formatExpiry(deal.expires_at);

  return (
    <article className="overflow-hidden rounded-2xl border border-blue-500/40 bg-[#050f30] shadow-[0_0_40px_rgba(37,99,235,0.1)] transition-colors hover:border-blue-400/70">
      <div className="flex">
        <div className="relative h-52 w-72 shrink-0 overflow-hidden border-r border-blue-500/20 bg-slate-800/70">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={deal.title} className="h-full w-full object-cover" src={deal.image_url} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800/80 text-xs text-muted-foreground">No image</div>
          )}
        </div>

        <div className="min-w-0 flex-1 p-5 pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <Link className="line-clamp-1 text-3xl font-semibold leading-tight text-slate-100 hover:text-blue-300" href={`/deals/${deal.id}`}>
                  {deal.title}
                </Link>
                {expiryLabel ? (
                  <span className="rounded-md border border-rose-400/30 bg-rose-500/10 px-3 py-1 text-sm font-medium text-rose-300">{expiryLabel}</span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Store className="h-3.5 w-3.5" />
                  {deal.stores?.name ?? 'Unknown store'}
                </span>
                <span>•</span>
                <span>{deal.categories?.name ?? 'General'}</span>
                <span>•</span>
                <span>{formatRelativeTime(deal.created_at)}</span>
              </div>
            </div>
          </div>

          <p className="mt-3 line-clamp-2 text-[1.35rem] leading-snug text-slate-200">{deal.description?.trim() || 'Brief description of the deal goes here for preview.'}</p>

          <div className="mt-5 flex items-center gap-4 text-4xl font-semibold">
            {salePrice ? <span className="text-emerald-300">{salePrice}</span> : null}
            {originalPrice ? <span className="text-2xl text-slate-400 line-through">{originalPrice}</span> : null}
            {deal.discount_percent !== null ? <span className="rounded-full bg-emerald-500/40 px-4 py-1 text-3xl text-emerald-100">-{deal.discount_percent}%</span> : null}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-blue-500/20 px-4 py-3">
        <div className="flex items-center gap-3 text-emerald-300">
          <button aria-label="Upvote deal" className="inline-flex items-center rounded-md p-1 transition-colors hover:bg-emerald-500/20">
            <ThumbsUp className="h-5 w-5" />
          </button>
          <span className="text-4xl font-semibold">{deal.score}</span>
          <button aria-label="Downvote deal" className="inline-flex items-center rounded-md p-1 text-rose-400 transition-colors hover:bg-rose-500/20">
            <ThumbsDown className="h-5 w-5" />
          </button>
          <span className="ml-6 inline-flex items-center gap-2 text-slate-400">
            <MessageSquare className="h-5 w-5" />
            <span className="text-3xl">{deal.comments_count}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button aria-label="Save deal" className="h-11 w-11 shrink-0 border border-blue-400/20 bg-blue-400/10 text-blue-300 hover:bg-blue-400/20 hover:text-blue-100" size="icon" variant="ghost">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Link
            className="inline-flex items-center rounded-xl bg-blue-400 px-6 py-2.5 text-2xl font-semibold text-slate-950 transition-colors hover:bg-blue-300"
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
