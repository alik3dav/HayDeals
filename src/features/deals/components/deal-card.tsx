import Image from 'next/image';
import Link from 'next/link';
import { MessageSquare, Store } from 'lucide-react';

import type { PublicDeal } from '@/features/deals/types';
import { UserAvatar } from '@/features/profile/components/user-avatar';
import { PublicProfileLink } from '@/features/profile/components/public-profile-link';
import { buildProfileDisplayName } from '@/features/profile/identity';

import { DealValueDisplay } from './deal-value-display';
import { DealCardInteractions } from './deal-card-interactions';


import { formatExpiryLabel, formatRelativeTime, getExpiryBadgeClassName } from '@/features/deals/utils/formatters';

type DealCardProps = {
  deal: PublicDeal;
  voteAction: (dealId: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string) => Promise<void>;
};

export function DealCard({ deal, voteAction, saveAction }: DealCardProps) {
  const expiryLabel = formatExpiryLabel(deal.expires_at);
  const expiryBadgeClassName = getExpiryBadgeClassName(deal.expires_at);
  const authorName = buildProfileDisplayName(deal.profiles ?? {});

  return (
    <article className="overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/40 md:grid md:min-h-60 md:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="relative aspect-square w-full shrink-0 overflow-hidden border-b border-border/60 bg-secondary/50 md:h-60 md:w-60 md:border-b-0 md:border-r">
          {deal.image_url ? (
            <Image
              alt={`Image for ${deal.title}`}
              className="object-cover"
              fill
              sizes="(max-width: 768px) 100vw, 240px"
              src={deal.image_url}
            />
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
          <PublicProfileLink className="font-medium text-foreground/85 hover:text-primary" username={deal.profiles?.username}>
            {authorName}
          </PublicProfileLink>
          <span>•</span>
          <span>{formatRelativeTime(deal.created_at)}</span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 md:self-end">
          <div className="min-w-0 text-left">
            <DealValueDisplay deal={deal} />
          </div>

          <DealCardInteractions
            dealId={deal.id}
            initialLikeCount={deal.upvotes_count}
            initialVote={deal.current_user_vote}
            initiallySaved={deal.is_saved_by_current_user}
            saveAction={saveAction}
            voteAction={voteAction}
          />

          <div className="flex items-center gap-2.5 text-emerald-600">
            <span className="ml-2 inline-flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{deal.comments_count}</span>
            </span>
          </div>
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
