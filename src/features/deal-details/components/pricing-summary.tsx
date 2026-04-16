import type { DealDetail } from '@/features/deal-details/types';
import { formatPrice } from '@/features/deal-details/components/deal-utils';
import { calculateDiscountPercentage } from '@/features/deals/utils/formatters';

export function PricingSummary({ deal }: { deal: DealDetail }) {
  const salePrice = formatPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatPrice(deal.original_price, deal.currency_code);
  const couponCode = deal.coupon_code?.trim() || null;
  const isCoupon = deal.deal_types?.code === 'coupon';
  const discountPercent = calculateDiscountPercentage(deal.original_price, deal.sale_price) ?? deal.discount_percent;
  const showCouponOnly = Boolean(couponCode) && !salePrice && !originalPrice && discountPercent === null;
  const showCouponWithPrices = isCoupon && Boolean(couponCode) && Boolean(salePrice || originalPrice);

  if (showCouponWithPrices) {
    return couponCode ? (
      <section className="rounded-lg border border-border/60 bg-card/70 p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <div className="inline-flex max-w-full items-center rounded-lg border border-dashed border-primary/50 bg-primary/10 px-3 py-2 font-mono text-sm font-semibold tracking-[0.12em] text-primary/80">
            <span className="truncate">{couponCode}</span>
          </div>
          {salePrice ? <span className="text-base font-semibold text-foreground">{salePrice}</span> : null}
          {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
        </div>
      </section>
    ) : null;
  }

  if (isCoupon || showCouponOnly) {
    return couponCode ? (
      <section className="rounded-lg border border-border/60 bg-card/70 p-4">
        <div className="inline-flex max-w-full items-center rounded-lg border border-dashed border-primary/50 bg-primary/10 px-3 py-2 font-mono text-sm font-semibold tracking-[0.12em] text-primary/80">
          <span className="truncate">{couponCode}</span>
        </div>
      </section>
    ) : null;
  }

  return (
    <section className="">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        {salePrice ? <span className="text-base font-semibold text-foreground">{salePrice}</span> : <span className="font-semibold text-foreground">See deal page</span>}
        {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
        {discountPercent !== null ? <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">-{discountPercent}%</span> : null}
      </div>

      {couponCode ? (
        <div className="text-xs text-muted-foreground">
         <span className="font-medium text-foreground">{couponCode}</span>
        </div>
      ) : null}
    </section>
  );
}
