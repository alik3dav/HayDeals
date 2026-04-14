import { TicketPercent, Tag } from 'lucide-react';

import { getDealTypeConfig } from '@/features/submit-deal/deal-type-config';
import { cn } from '@/lib/utils';

type DealPreviewCardProps = {
  title: string;
  description: string;
  storeLabel: string;
  categoryLabel: string;
  dealTypeLabel: string;
  dealTypeCode: string;
  dealUrl: string;
  salePrice: string;
  originalPrice: string;
  discountPercent: string;
  couponCode: string;
  bundleText: string;
  imageUrl: string;
};

function getPrimaryDisplay({
  dealTypeCode,
  salePrice,
  originalPrice,
  discountPercent,
  couponCode,
  bundleText,
}: Pick<DealPreviewCardProps, 'dealTypeCode' | 'salePrice' | 'originalPrice' | 'discountPercent' | 'couponCode' | 'bundleText'>) {
  const config = getDealTypeConfig(dealTypeCode);

  switch (config.cardDisplay.primary) {
    case 'price':
      return { headline: salePrice || 'Price', subline: '' };
    case 'price_drop':
      return { headline: salePrice || 'Sale price', subline: originalPrice || 'Original price' };
    case 'percentage':
      return { headline: discountPercent ? `-${discountPercent}%` : '% off', subline: '' };
    case 'coupon':
      return { headline: couponCode || 'COUPON', subline: '' };
    case 'bundle':
      return { headline: bundleText || 'Bundle offer', subline: '' };
    case 'cashback':
      return { headline: discountPercent ? `${discountPercent}% cashback` : 'Cashback', subline: '' };
    case 'free':
      return { headline: 'FREE', subline: couponCode ? `Code: ${couponCode}` : '' };
    case 'info':
      return { headline: 'Info', subline: '' };
    default:
      return { headline: 'Deal', subline: '' };
  }
}

export function DealPreviewCard(props: DealPreviewCardProps) {
  const resolvedTitle = props.title || 'Your deal title will appear here';
  const resolvedDescription = props.description || 'Describe what makes this deal worth sharing.';
  const config = getDealTypeConfig(props.dealTypeCode);
  const primaryDisplay = getPrimaryDisplay(props);

  return (
    <article className="flex items-center gap-4 overflow-hidden rounded-xl border border-border/70 bg-card/80 p-3">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-secondary/60">
        {props.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Deal preview" className="h-full w-full object-cover" src={props.imageUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="line-clamp-1 text-sm font-semibold">{resolvedTitle}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{resolvedDescription}</p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{props.storeLabel || 'Store'}</span>
          <span>•</span>
          <span>{props.categoryLabel || 'Category'}</span>
          <span>•</span>
          <span>{props.dealTypeLabel || 'Type'}</span>
          {config.cardDisplay.badge ? <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">{config.cardDisplay.badge}</span> : null}
          {props.couponCode ? (
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
              <TicketPercent className="h-3 w-3" />
              {props.couponCode}
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-right text-xs">
        <p className="text-sm font-semibold">{primaryDisplay.headline}</p>
        {primaryDisplay.subline ? <p className="text-muted-foreground line-through">{primaryDisplay.subline}</p> : null}
        <a className={cn('mt-1 inline-flex items-center gap-1 text-primary')} href={props.dealUrl || '#'} rel="noreferrer" target="_blank">
          <Tag className="h-3 w-3" />
          Open
        </a>
      </div>
    </article>
  );
}
