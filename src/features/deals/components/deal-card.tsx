import Link from 'next/link';
import { Bookmark, MessageSquare, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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

  return (
    <article className="flex items-center gap-4 rounded-xl border border-border/70 bg-card/80 px-3 py-3 shadow-sm transition-colors hover:border-primary/35">
      <div className="hidden min-w-14 flex-col items-center justify-center rounded-lg bg-secondary/60 px-2 py-2 text-xs text-muted-foreground sm:flex">
        <ThumbsUp className="h-3.5 w-3.5" />
        <span className="mt-1 text-sm font-semibold text-foreground">{deal.score}</span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <Link className="line-clamp-2 text-sm font-semibold text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
              {deal.title}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{deal.stores?.name ?? 'Unknown store'}</span>
              <span>•</span>
              <span>{deal.categories?.name ?? 'General'}</span>
              <span>•</span>
              <span>{formatRelativeTime(deal.created_at)}</span>
            </div>
          </div>

          {deal.deal_types?.name ? (
            <span className="shrink-0 rounded-md border border-primary/35 bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary">
              {deal.deal_types.name}
            </span>
          ) : null}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {salePrice ? <span className="text-sm font-semibold text-foreground">{salePrice}</span> : <span className="font-medium text-foreground">See deal</span>}

          {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}

          {deal.discount_percent !== null ? (
            <span className={cn('rounded bg-emerald-500/10 px-1.5 py-0.5 font-medium text-emerald-400')}>
              -{deal.discount_percent}%
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1 text-muted-foreground sm:hidden">
            <ThumbsUp className="h-3.5 w-3.5" />
            {deal.score}
          </span>

          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            {deal.comments_count}
          </span>
        </div>
      </div>

      <Button aria-label="Save deal" className="shrink-0" size="icon" variant="ghost">
        <Bookmark className="h-4 w-4" />
      </Button>
    </article>
  );
}
