import type { DealDetail } from '@/features/deal-details/types';
import { formatPrice } from '@/features/deal-details/components/deal-utils';

function calculateDiscountPercentage(originalPrice: number | null, salePrice: number | null) {
  if (originalPrice === null || salePrice === null) {
    return null;
  }

  if (originalPrice <= 0 || salePrice < 0 || salePrice >= originalPrice) {
    return null;
  }

  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function PricingSummary({ deal }: { deal: DealDetail }) {
  const salePrice = formatPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatPrice(deal.original_price, deal.currency_code);
  const isCoupon = deal.deal_types?.code === 'coupon';
  const discountPercent = calculateDiscountPercentage(deal.original_price, deal.sale_price) ?? deal.discount_percent;

  return (
    <section className="rounded-lg border border-border/60 bg-card/70 p-4">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {salePrice ? <span className="text-base font-semibold text-foreground">{salePrice}</span> : <span className="font-semibold text-foreground">See deal page</span>}
        {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
        {discountPercent !== null ? <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">-{discountPercent}%</span> : null}
      </div>

      {isCoupon ? (
        <div className="mt-3 rounded border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-300">
          Coupon: <span className="font-semibold">{deal.coupon_code ?? 'Shown on merchant page'}</span>
        </div>
      ) : deal.coupon_code ? (
        <div className="text-xs text-muted-foreground">
         <span className="font-medium text-foreground">{deal.coupon_code}</span>
        </div>
      ) : null}
    </section>
  );
}
