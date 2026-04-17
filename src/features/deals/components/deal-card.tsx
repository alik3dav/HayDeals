import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, MessageSquare, Store } from 'lucide-react';

import type { PublicDeal } from '@/features/deals/types';
import { getAvailabilityLabel } from '@/features/deals/availability';
import { UserAvatar } from '@/features/profile/components/user-avatar';
import { PublicProfileLink } from '@/features/profile/components/public-profile-link';
import { buildProfileDisplayName } from '@/features/profile/identity';
import { ProfileDisplayName } from '@/features/profile/components/profile-display-name';
import { toPlainText } from '@/lib/text-formatting';

import { DealValueDisplay } from './deal-value-display';
import { DealCardInteractions } from './deal-card-interactions';


import { formatExpiryLabel, formatRelativeTime, getExpiryBadgeClassName } from '@/features/deals/utils/formatters';

type DealCardProps = {
  deal: PublicDeal;
  voteAction: (dealId: string, dealSlug: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string, dealSlug: string) => Promise<void>;
};

export function DealCard({ deal, voteAction, saveAction }: DealCardProps) {
  const expiryLabel = formatExpiryLabel(deal.expires_at);
  const expiryBadgeClassName = getExpiryBadgeClassName(deal.expires_at);
  const authorName = buildProfileDisplayName(deal.profiles ?? {});
  const availabilityLabel = getAvailabilityLabel({
    availabilityScope: deal.availability_scope,
    availabilityRegion: deal.availability_region,
    availabilityCountryCode: deal.availability_country_code,
  });

  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition-colors hover:border-primary/40 md:grid md:min-h-60 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)]">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden border-b border-border/60 bg-secondary/50 sm:aspect-[16/10] md:h-60 md:w-52 md:aspect-auto md:border-b-0 md:border-r lg:w-60">
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
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-[4px] border border-border bg-secondary px-3 py-1.5" >
                <Store className="h-3 w-3" />
                <span className="truncate">{deal.stores?.name ?? deal.merchant_name ?? 'Unknown store'}</span>
              </span>
              <span>•</span>
              <span>{deal.categories?.name ?? 'General'}</span>
              <span>•</span>
              <span>{availabilityLabel}</span>
              {expiryLabel && expiryBadgeClassName ? (
                <>
                  <span>•</span>
                <span className={`rounded-md border px-2 py-0.5 text-xs font-small ${expiryBadgeClassName}`}>{expiryLabel}</span>
                </>
              ) : null}
            </div>
          
              <Link className="line-clamp-2 text-lg font-semibold leading-tight text-foreground hover:text-primary md:line-clamp-1 md:text-xl md:self-center" href={`/deals/${deal.slug}`}>
                {deal.title}
              </Link>
              
            
           
     
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground/40 md:self-center">{toPlainText(deal.description ?? '') || 'Brief description of the deal goes here for preview.'}</p>

        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground/70 md:self-center">
          <UserAvatar avatarUrl={deal.profiles?.avatar_url} className="h-6 w-6" fallbackText={authorName} textClassName="text-[10px]" />
          <PublicProfileLink className="font-small text-[13px] text-foreground/85 hover:text-primary" username={deal.profiles?.username}>
            <ProfileDisplayName isVerified={deal.profiles?.is_verified} name={authorName} />
          </PublicProfileLink>
          <span>•</span>
          <span>{formatRelativeTime(deal.created_at)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 md:self-end">
          <div className="min-w-0 text-left">
            <DealValueDisplay deal={deal} />
          </div>
          <div className="flex items-center gap-2.5 text-emerald-600 sm:ml-auto">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">{deal.comments_count}</span>
            </span>
          </div>
          <DealCardInteractions
            dealId={deal.id}
            dealSlug={deal.slug}
            initialLikeCount={deal.upvotes_count}
            initialVote={deal.current_user_vote}
            initiallySaved={deal.is_saved_by_current_user}
            saveAction={saveAction}
            voteAction={voteAction}
          />

         
          <Link
            className="inline-flex items-center rounded-full bg-[#F5F5F5] px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#E8E8E8] max-sm:w-full max-sm:justify-center"
            href={deal.deal_url}
            rel="noreferrer"
            target="_blank"
            aria-label="See deal"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
