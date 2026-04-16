import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { UserAvatar } from '@/features/profile/components/user-avatar';
import type { FeedFacetCollections, PublicDeal, SidebarCommunityStats } from '@/features/deals/types';
import { SidebarAdModule } from '@/features/deals/components/sidebar-ad-module';
import { feedSidebarAd } from '@/features/deals/components/sidebar-ad-data';
import type { SidebarAd } from '@/features/deals/components/sidebar-ad-module';

type FeedSidebarProps = {
  trendingDeals: PublicDeal[];
  facets: FeedFacetCollections;
  communityStats: SidebarCommunityStats;
  sidebarAd?: SidebarAd;
};

type SidebarSectionProps = {
  title: string;
  children: ReactNode;
};

function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/30 p-4">
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </section>
  );
}

function buildCategoryHref(category: string) {
  return `/categories/${encodeURIComponent(category)}`;
}

export function FeedSidebar({ trendingDeals, facets, communityStats, sidebarAd }: FeedSidebarProps) {
  const topCategories = facets.categories.slice(0, 6);
  const visibleMembers = communityStats.recentMembers.slice(0, 5);
  const overflowMembers = Math.max(communityStats.activeMembers - visibleMembers.length, 0);
  const formattedMemberCount = new Intl.NumberFormat('en-US').format(communityStats.activeMembers);

  return (
    <aside className="space-y-3 lg:sticky lg:top-[5.25rem] lg:self-start">
      <SidebarSection title="Trending deals">
        {trendingDeals.length ? (
          <ul className="space-y-2">
            {trendingDeals.map((deal) => (
              <li key={`trending-${deal.id}`}>
                <Link
                  className="group grid grid-cols-[3.25rem_minmax(0,1fr)] gap-2 rounded-md p-1 transition-colors hover:bg-muted/30"
                  href={`/deals/${deal.slug}`}
                >
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border/70 bg-secondary/50">
                    {deal.image_url ? (
                      <Image alt={`Image for ${deal.title}`} className="object-cover" fill sizes="48px" src={deal.image_url} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">No image</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">{deal.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">Score {deal.score}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No trending deals yet.</p>
        )}
      </SidebarSection>

      <SidebarAdModule ad={sidebarAd ?? feedSidebarAd} />

      <SidebarSection title="Browse platform">
        <ul className="space-y-2 text-sm">
          <li>
            <Link className="text-foreground/90 transition-colors hover:text-foreground" href="/deals">
              All deals directory
            </Link>
          </li>
          <li>
            <Link className="text-foreground/90 transition-colors hover:text-foreground" href="/categories">
              All categories
            </Link>
          </li>
          <li>
            <Link className="text-foreground/90 transition-colors hover:text-foreground" href="/deals?sort=hot">
              Hot deals feed
            </Link>
          </li>
        </ul>
      </SidebarSection>

      <SidebarSection title="Top categories">
        {topCategories.length ? (
          <div className="flex flex-wrap gap-2">
            {topCategories.map((category) => (
              <Link
                className="rounded-md border border-border/80 px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                href={buildCategoryHref(category.value)}
                key={`category-${category.value}`}
              >
                {category.label}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Categories will appear as deals are added.</p>
        )}
      </SidebarSection>

      <section className="rounded-xl border border-border/70 bg-gradient-to-b from-card/60 to-card/20 p-5 shadow-[0_0_0_1px_hsl(var(--background)/0.2)_inset]">
        <h2 className="text-[1rem] font-semibold leading-tight text-foreground">{formattedMemberCount}+ active members</h2>
        <p className="text-[12px] text-muted-foreground">Sharing deals from around the world</p>

        <div className="mt-5 flex items-center">
          {visibleMembers.map((member, index) => (
            <div className={index === 0 ? '' : '-ml-2.5'} key={`${member.username ?? member.displayName}-${index}`}>
              <UserAvatar
                avatarUrl={member.avatarUrl}
                fallbackText={member.displayName}
                className="h-12 w-12 border border-background/60 bg-muted text-sm shadow"
                textClassName="text-sm"
              />
            </div>
          ))}
          {overflowMembers > 0 ? (
            <span className="-ml-2.5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-background/60 bg-muted text-lg font-semibold text-foreground shadow">
              +{Math.min(overflowMembers, 99)}
            </span>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
