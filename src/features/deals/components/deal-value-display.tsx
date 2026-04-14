import { Badge } from '@/components/ui/badge';
import type { PublicDeal } from '@/features/deals/types';

import { buildDealValueModel } from './deal-value-display.helpers';

type DealValueDisplayProps = {
  deal: PublicDeal;
};

function PriceBlock({
  currentPrice,
  originalPrice,
  discountBadgeLabel,
  isCoupon,
  couponCode,
}: {
  currentPrice?: string | null;
  originalPrice?: string | null;
  discountBadgeLabel?: string | null;
  isCoupon?: boolean;
  couponCode?: string | null;
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card/70 p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        {currentPrice ? <span className="text-base font-semibold text-foreground">{currentPrice}</span> : <span className="font-semibold text-foreground">See deal page</span>}
        {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
        {discountBadgeLabel ? <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">{discountBadgeLabel}</span> : null}
      </div>

      {isCoupon ? (
        <div className="mt-3 rounded border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-300">
          Coupon: <span className="font-semibold">{couponCode ?? 'Shown on merchant page'}</span>
        </div>
      ) : couponCode ? (
        <div className="mt-3 text-xs text-muted-foreground">
          Optional code: <span className="font-medium text-foreground">{couponCode}</span>
        </div>
      ) : null}
    </section>
  );
}

function PriceDropBlock({
  currentPrice,
  originalPrice,
  discountBadgeLabel,
  couponCode,
}: {
  currentPrice: string | null;
  originalPrice: string | null;
  discountBadgeLabel: string | null;
  couponCode?: string | null;
}) {
  return <PriceBlock currentPrice={currentPrice} couponCode={couponCode} discountBadgeLabel={discountBadgeLabel} originalPrice={originalPrice} />;
}

export function DealValueDisplay({ deal }: DealValueDisplayProps) {
  const value = buildDealValueModel(deal);
  const isCoupon = value.typeCode === 'coupon';
  const hasPriceSectionData = Boolean(value.currentPrice || value.originalPrice || value.discountBadgeLabel || value.couponCode);

  if (process.env.NODE_ENV !== 'production' && value.typeCode === 'price_drop') {
    console.debug('DealValueDisplay price_drop debug', {
      dealId: deal.id,
      dealType: deal.deal_types?.code ?? null,
      salePrice: deal.sale_price,
      originalPrice: deal.original_price,
      salePriceIsNumber: typeof deal.sale_price === 'number' && Number.isFinite(deal.sale_price),
      originalPriceIsNumber: typeof deal.original_price === 'number' && Number.isFinite(deal.original_price),
    });
  }

  switch (value.typeCode) {
    case 'price':
      return (
        <PriceBlock
          currentPrice={value.currentPrice}
          couponCode={value.couponCode}
          discountBadgeLabel={value.discountBadgeLabel}
          isCoupon={isCoupon}
          originalPrice={value.originalPrice}
        />
      );

    case 'price_drop':
      return <PriceDropBlock currentPrice={value.currentPrice} couponCode={value.couponCode} discountBadgeLabel={value.discountBadgeLabel} originalPrice={value.originalPrice} />;

    case 'coupon':
      return (
        <PriceBlock
          currentPrice={value.currentPrice}
          couponCode={value.couponCode}
          discountBadgeLabel={value.discountBadgeLabel}
          isCoupon={isCoupon}
          originalPrice={value.originalPrice}
        />
      );

    case 'percentage':
      return value.percentageLabel ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-sm font-semibold text-emerald-400">{value.percentageLabel}</span> : null;

    case 'bundle':
      return <span className="text-base font-semibold text-foreground">{value.bundleText || 'Bundle offer'}</span>;

    case 'cashback':
      return <span className="text-base font-semibold text-emerald-400">{value.percentageLabel ? `${value.percentageLabel.replace('-', '')} cashback` : 'Cashback'}</span>;

    case 'free':
      return (
        <Badge className="border-emerald-500/30 bg-emerald-500/15 text-[11px] font-semibold tracking-wide text-emerald-500" variant="outline">
          FREE
        </Badge>
      );

    case 'info':
    default: {
      if (hasPriceSectionData) {
        return (
          <PriceBlock
            currentPrice={value.currentPrice}
            couponCode={value.couponCode}
            discountBadgeLabel={value.discountBadgeLabel}
            isCoupon={isCoupon}
            originalPrice={value.originalPrice}
          />
        );
      }

      const fallback = value.bundleText || value.percentageLabel || value.dealTypeLabel || 'See details';
      return <span className="text-base font-medium text-foreground">{fallback}</span>;
    }
  }
}
