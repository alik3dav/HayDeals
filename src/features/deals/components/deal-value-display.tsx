import { Badge } from '@/components/ui/badge';
import type { PublicDeal } from '@/features/deals/types';

import { buildDealValueModel } from './deal-value-display.helpers';

type DealValueDisplayProps = {
  deal: PublicDeal;
};

function CouponCodeBlock({ code }: { code: string }) {
  return (
    <div className="inline-flex max-w-full items-center rounded-lg border border-dashed border-success/60 bg-success/10 px-3 py-2 font-mono text-sm font-semibold tracking-[0.12em] text-success">
      <span className="truncate">{code}</span>
    </div>
  );
}

function CouponValueRow({
  couponCode,
  currentPrice,
  originalPrice,
}: {
  couponCode: string;
  currentPrice?: string | null;
  originalPrice?: string | null;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <CouponCodeBlock code={couponCode} />
      {currentPrice ? <span className="text-base font-semibold text-success">{currentPrice}</span> : null}
      {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
    </div>
  );
}

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
  const showCouponOnly = Boolean(couponCode) && !currentPrice && !originalPrice && !discountBadgeLabel;

  if (showCouponOnly) {
    return <CouponCodeBlock code={couponCode!} />;
  }

  if (isCoupon && couponCode && (currentPrice || originalPrice)) {
    return (
      <section>
        <CouponValueRow couponCode={couponCode} currentPrice={currentPrice} originalPrice={originalPrice} />
      </section>
    );
  }

  return (
    <section>
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
        {currentPrice ? <span className="text-base font-semibold text-success">{currentPrice}</span> : <span className="font-semibold text-foreground">See deal page</span>}
        {originalPrice ? <span className="text-muted-foreground line-through">{originalPrice}</span> : null}
        {discountBadgeLabel ? <span className="rounded bg-success/10 px-1.5 py-0.5 text-xs text-success">{discountBadgeLabel}</span> : null}
      </div>

      {isCoupon ? (
        <div className="mt-3 rounded border border-warning/30 bg-warning/10 px-2 py-1.5 text-xs text-warning">
          Coupon: <span className="font-semibold">{couponCode ?? 'Shown on merchant page'}</span>
        </div>
      ) : couponCode ? (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{couponCode}</span>
        </div>
      ) : null}
    </section>
  );
}

export function DealValueDisplay({ deal }: DealValueDisplayProps) {
  const value = buildDealValueModel(deal);
  const isCoupon = value.typeCode === 'coupon';
  const hasPriceSectionData = Boolean(value.currentPrice || value.originalPrice || value.discountBadgeLabel || value.couponCode);

  if (value.typeCode === 'price' || value.typeCode === 'price_drop') {
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

  switch (value.typeCode) {
    case 'coupon':
      if (value.couponCode && (value.currentPrice || value.originalPrice)) {
        return <CouponValueRow couponCode={value.couponCode} currentPrice={value.currentPrice} originalPrice={value.originalPrice} />;
      }

      return value.couponCode ? (
        <CouponCodeBlock code={value.couponCode} />
      ) : (
        <Badge className="border-primary/30 bg-primary/10 text-xs text-primary" variant="outline">
          COUPON
        </Badge>
      );

    case 'percentage':
      return value.percentageLabel ? <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-sm font-semibold text-success">{value.percentageLabel}</span> : null;

    case 'bundle':
      return <span className="text-base font-semibold text-foreground">{value.bundleText || 'Bundle offer'}</span>;

    case 'cashback':
      return <span className="text-base font-semibold text-success">{value.percentageLabel ? `${value.percentageLabel.replace('-', '')} cashback` : 'Cashback'}</span>;

    case 'free':
      return (
        <Badge className="border-success/30 bg-success/15 text-[11px] font-semibold tracking-wide text-success" variant="outline">
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
      return <span className="text-lg font-medium text-success">{fallback}</span>;
    }
  }
}
