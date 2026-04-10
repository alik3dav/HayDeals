import Link from 'next/link';
import { MessageSquare, ThumbsUp } from 'lucide-react';

import type { RelatedDeal } from '@/features/deal-details/types';
import { formatPrice } from '@/features/deal-details/components/deal-utils';

export function RelatedDeals({ deals }: { deals: RelatedDeal[] }) {
  return (
    <section className="space-y-2 rounded-lg border border-border/60 bg-card/70 p-3">
      <h2 className="text-sm font-semibold text-foreground">Related deals</h2>
      {deals.length === 0 ? <p className="text-xs text-muted-foreground">No related deals available.</p> : null}
      <ul className="space-y-2">
        {deals.map((deal) => (
          <li className="rounded-md border border-border/50 bg-background/50 p-2" key={deal.id}>
            <Link className="text-sm text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
              {deal.title}
            </Link>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatPrice(deal.sale_price, deal.currency_code) ?? 'See deal'}</span>
              <span className="inline-flex items-center gap-1">
                <ThumbsUp className="h-3 w-3" />
                {deal.score}
              </span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {deal.comments_count}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
