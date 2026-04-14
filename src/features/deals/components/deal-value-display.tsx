import { Badge } from '@/components/ui/badge';
import type { PublicDeal } from '@/features/deals/types';

import { buildDealValueModel } from './deal-value-display.helpers';

type DealValueDisplayProps = {
  deal: PublicDeal;
};

function CouponCodeBlock({ code }: { code: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Coupon</span>
      <div className="inline-flex max-w-full items-center rounded-lg border border-dashed border-primary/50 bg-primary/5 px-3 py-2 font-mono text-sm font-semibold tracking-[0.12em] text-primary">
        <span className="truncate">{code}</span>
      </div>
    </div>
  );
}

function PriceBlock({ currentPrice, originalPrice, discountBadgeLabel }: { currentPrice: string; originalPrice?: string | null; discountBadgeLabel?: string | null }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <span className="text-2xl font-semibold leading-none text-emerald-400">{currentPrice}</span>
      {originalPrice ? <span className="text-sm text-muted-foreground line-through">{originalPrice}</span> : null}
      {discountBadgeLabel ? <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">{discountBadgeLabel}</span> : null}
    </div>
  );
}

function PriceDropBlock({
  currentPrice,
  originalPrice,
  discountBadgeLabel,
}: {
  currentPrice: string;
  originalPrice: string | null;
  discountBadgeLabel: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
          <span className="font-medium">Current</span>
          <span className="text-base font-semibold normal-case leading-none text-emerald-400">{currentPrice}</span>
        </span>
        {originalPrice ? (
          <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
            <span className="font-medium">Original</span>
            <span className="text-sm font-medium normal-case text-muted-foreground line-through">{originalPrice}</span>
          </span>
        ) : null}
        {discountBadgeLabel ? (
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">{discountBadgeLabel}</span>
        ) : null}
      </div>
      {originalPrice && discountBadgeLabel ? (
        <div className="text-xs text-muted-foreground">
          You save {discountBadgeLabel.replace('-', '')} from {originalPrice}.
        </div>
      ) : null}
    </div>
  );
}

export function DealValueDisplay({ deal }: DealValueDisplayProps) {
  const value = buildDealValueModel(deal);

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
      if (!value.currentPrice) return null;
      return <PriceBlock currentPrice={value.currentPrice} discountBadgeLabel={value.discountBadgeLabel} originalPrice={value.originalPrice} />;

    case 'price_drop':
      if (!value.currentPrice) return null;
      return <PriceDropBlock currentPrice={value.currentPrice} discountBadgeLabel={value.discountBadgeLabel} originalPrice={value.originalPrice} />;

    case 'coupon':
      return (
        <div className="flex min-w-0 flex-wrap items-end gap-3">
          {value.couponCode ? <CouponCodeBlock code={value.couponCode} /> : null}
          {value.currentPrice ? <PriceBlock currentPrice={value.currentPrice} originalPrice={value.originalPrice} discountBadgeLabel={value.discountBadgeLabel} /> : null}
          {!value.couponCode && !value.currentPrice ? (
            <Badge className="border-primary/30 bg-primary/10 text-xs text-primary" variant="outline">
              COUPON
            </Badge>
          ) : null}
        </div>
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
      const fallback = value.currentPrice || value.couponCode || value.bundleText || value.percentageLabel || value.dealTypeLabel || 'See details';
      return <span className="text-base font-medium text-foreground">{fallback}</span>;
    }
  }
}
