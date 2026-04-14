import { Badge } from '@/components/ui/badge';
import type { PublicDeal } from '@/features/deals/types';

import { buildDealValueModel, getDiscountPercentage, formatDealPrice } from './deal-value-display.helpers';

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

function PriceBlock({
  salePrice,
  originalPrice,
  discountPercent,
  currencyCode,
}: {
  salePrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  currencyCode: string;
}) {
  const salePriceLabel = formatDealPrice(salePrice, currencyCode);
  const originalPriceLabel = formatDealPrice(originalPrice, currencyCode);

  return (
    <section className="rounded-lg border border-border/60 bg-card/70 p-4">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        {salePriceLabel ? <span className="text-base font-semibold text-foreground">{salePriceLabel}</span> : <span className="font-semibold text-foreground">See deal page</span>}
        {originalPriceLabel ? <span className="text-muted-foreground line-through">{originalPriceLabel}</span> : null}
        {discountPercent !== null ? <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs text-emerald-400">-{discountPercent}%</span> : null}
      </div>
    </section>
  );
}

function PriceDropBlock({
  salePrice,
  originalPrice,
  discountPercent,
  currencyCode,
}: {
  salePrice: number | null;
  originalPrice: number | null;
  discountPercent: number | null;
  currencyCode: string;
}) {
  return <PriceBlock currencyCode={currencyCode} discountPercent={discountPercent} originalPrice={originalPrice} salePrice={salePrice} />;
}

export function DealValueDisplay({ deal }: DealValueDisplayProps) {
  const value = buildDealValueModel(deal);
  const discountPercent = getDiscountPercentage(deal.original_price, deal.sale_price) ?? deal.discount_percent;

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
      return <PriceBlock currencyCode={deal.currency_code} discountPercent={discountPercent} originalPrice={deal.original_price} salePrice={deal.sale_price} />;

    case 'price_drop':
      return (
        <PriceDropBlock currencyCode={deal.currency_code} discountPercent={discountPercent} originalPrice={deal.original_price} salePrice={deal.sale_price} />
      );

    case 'coupon':
      return (
        <div className="flex min-w-0 flex-wrap items-end gap-3">
          {value.couponCode ? <CouponCodeBlock code={value.couponCode} /> : null}
          {value.currentPrice ? (
            <PriceBlock currencyCode={deal.currency_code} discountPercent={discountPercent} originalPrice={deal.original_price} salePrice={deal.sale_price} />
          ) : null}
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
