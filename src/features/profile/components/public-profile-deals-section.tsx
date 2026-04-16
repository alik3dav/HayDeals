import Link from 'next/link';
import { MessageSquare, Store } from 'lucide-react';

import type { PublicProfileDeal } from '@/features/profile/public-profile.types';
import { formatCurrency } from '@/features/deals/utils/formatters';

export function PublicProfileDealsSection({ deals }: { deals: PublicProfileDeal[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">Recent deals</h2>

      {deals.length === 0 ? <p className="text-sm text-muted-foreground">No public deals yet.</p> : null}

      <ul className="space-y-2">
        {deals.map((deal) => (
          <li className="rounded-lg border border-border/50 bg-background/40 p-3" key={deal.id}>
            <Link className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary" href={`/deals/${deal.id}`}>
              {deal.title}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Store className="h-3 w-3" /> {deal.stores?.name ?? 'Unknown store'}
              </span>
              <span>•</span>
              <span>{new Date(deal.created_at).toLocaleDateString(undefined)}</span>
              <span>•</span>
              <span>Score {deal.score}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {deal.comments_count}
              </span>
              {formatCurrency(deal.sale_price, deal.currency_code) ? (
                <>
                  <span>•</span>
                  <span>{formatCurrency(deal.sale_price, deal.currency_code)}</span>
                </>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
