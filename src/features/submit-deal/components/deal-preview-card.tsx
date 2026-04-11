import { TicketPercent, Tag } from 'lucide-react';

import { cn } from '@/lib/utils';

type DealPreviewCardProps = {
  title: string;
  description: string;
  storeLabel: string;
  categoryLabel: string;
  dealTypeLabel: string;
  dealUrl: string;
  salePrice: string;
  originalPrice: string;
  couponCode: string;
  imageUrl: string;
};

export function DealPreviewCard({
  title,
  description,
  storeLabel,
  categoryLabel,
  dealTypeLabel,
  dealUrl,
  salePrice,
  originalPrice,
  couponCode,
  imageUrl,
}: DealPreviewCardProps) {
  const resolvedTitle = title || 'Your deal title will appear here';
  const resolvedDescription = description || 'Describe what makes this deal worth sharing.';

  return (
    <article className="flex items-center gap-4 overflow-hidden rounded-xl border border-border/70 bg-card/80 p-3">
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-secondary/60">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="Deal preview" className="h-full w-full object-cover" src={imageUrl} />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No image</div>
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="line-clamp-1 text-sm font-semibold">{resolvedTitle}</h3>
        <p className="line-clamp-2 text-xs text-muted-foreground">{resolvedDescription}</p>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span>{storeLabel || 'Store'}</span>
          <span>•</span>
          <span>{categoryLabel || 'Category'}</span>
          <span>•</span>
          <span>{dealTypeLabel || 'Type'}</span>
          {couponCode ? (
            <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-primary">
              <TicketPercent className="h-3 w-3" />
              {couponCode}
            </span>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-right text-xs">
        <p className="text-sm font-semibold">{salePrice || 'Price'}</p>
        {originalPrice ? <p className="text-muted-foreground line-through">{originalPrice}</p> : null}
        <a className={cn('mt-1 inline-flex items-center gap-1 text-primary')} href={dealUrl || '#'} rel="noreferrer" target="_blank">
          <Tag className="h-3 w-3" />
          Open
        </a>
      </div>
    </article>
  );
}
