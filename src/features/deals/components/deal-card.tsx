import Link from 'next/link';
import { Bookmark, MessageSquare, Store, ThumbsDown, ThumbsUp } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { PublicDeal } from '@/features/deals/types';
import { UserAvatar } from '@/features/profile/components/user-avatar';

import { DealValueDisplay } from './deal-value-display';


import { formatExpiryLabel, formatRelativeTime, getExpiryBadgeClassName } from '@/features/deals/utils/formatters';

type DealCardProps = {
  deal: PublicDeal;
};

export function DealCard({ deal }: DealCardProps) {
  const expiryLabel = formatExpiryLabel(deal.expires_at);
  const expiryBadgeClassName = getExpiryBadgeClassName(deal.expires_at);
  const authorFullName = [deal.profiles?.first_name, deal.profiles?.last_name].filter(Boolean).join(' ').trim();
  const authorName = authorFullName || deal.profiles?.display_name || deal.profiles?.username || 'User';

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/40 md:flex md:min-h-60">
      <div className="relative aspect-square p-2 bg-white w-full shrink-0 overflow-hidden border-b border-border/60 bg-secondary/50 md:h-60 md:w-60 md:border-b-0 md:border-r">
          {deal.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={deal.title} className="h-full w-full object-cover" src={deal.image_url} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/70 text-xs text-muted-foreground">No image</div>
          )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 md:grid md:h-60 md:grid-rows-5 md:gap-2">
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground/60 md:mt-0 md:self-center">
              <span className="inline-flex items-center gap-1.5  bg-[#191d25] py-1.5 px-3 rounded-[4px]" >
                <Store className="h-3 w-3" />
                {deal.stores?.name ?? deal.merchant_name ?? 'Unknown store'}
              </span>
              <span>•</span>
              <span>{deal.categories?.name ?? 'General'}</span>
              {expiryLabel && expiryBadgeClassName ? (
                <>
                  <span>•</span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-small ${expiryBadgeClassName}`}>{expiryLabel}</span>
                </>
              ) : null}
            </div>
          
              <Link className="line-clamp-1 text-xl font-semibold leading-tight text-foreground hover:text-primary md:self-center" href={`/deals/${deal.id}`}>
                {deal.title}
              </Link>
              
            
           
     
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground/60 md:self-center">{deal.description?.trim() || 'Brief description of the deal goes here for preview.'}</p>

        <div className="flex items-center gap-2 text-sm text-muted-foreground/70 md:self-center">
          <UserAvatar avatarUrl={deal.profiles?.avatar_url} className="h-6 w-6" fallbackText={authorName} textClassName="text-[10px]" />
          <span className="font-medium text-foreground/85">{authorName}</span>
          <span>•</span>
          <span>{formatRelativeTime(deal.created_at)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:self-end">
          <div className="min-w-0 text-left">
            <DealValueDisplay deal={deal} />
          </div>

          <div className="ml-auto flex items-center gap-2.5 text-emerald-600">
           <div className='flex justify-between items-center bg-[#191d25] border  border-[#252C3A] rounded-full py-1 px-1 gap-2'>
           <button aria-label="Upvote deal" className="inline-flex items-center rounded-full p-2 transition-colors hover:bg-emerald-500/15">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <span className="text-base font-semibold">{deal.score}</span>
            <button aria-label="Downvote deal" className="inline-flex items-center rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-500/15">
              <ThumbsDown className="h-4 w-4" />
            </button>
           </div>
          
            <span className="ml-2 inline-flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{deal.comments_count}</span>
            </span>
          </div>

          <Button aria-label="Save deal" className="h-10 w-10 shrink-0 border border-border rounded-full bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground" size="icon" variant="ghost">
            <Bookmark className="h-4 w-4" />
          </Button>
          <Link
            className="inline-flex items-center rounded-full bg-[#F5F5F5] px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#E8E8E8]"
            href={deal.deal_url}
            rel="noreferrer"
            target="_blank"
          >
            See Deal
          </Link>
        </div>
      </div>
    </article>
  );
}
