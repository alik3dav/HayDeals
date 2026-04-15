import Image from 'next/image';

import type { DealDetail } from '@/features/deal-details/types';

export function DealImageCard({ deal }: { deal: DealDetail }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/60 bg-card/70">
      <div className="relative aspect-square bg-secondary/50">
        {deal.image_url ? (
          <Image
            alt={`Deal image for ${deal.title}`}
            className="object-cover"
            fill
            loading="eager"
            priority
            sizes="(max-width: 1024px) 100vw, 320px"
            src={deal.image_url}
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center px-4 text-xs text-muted-foreground">No deal image provided</div>
        )}
      </div>
    </div>
  );
}
