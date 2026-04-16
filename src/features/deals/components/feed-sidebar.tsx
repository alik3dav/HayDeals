import Link from 'next/link';
import type { ReactNode } from 'react';

import { UserAvatar } from '@/features/profile/components/user-avatar';
import type { FeedFacetCollections, PublicDeal, SidebarCommunityStats } from '@/features/deals/types';

type FeedSidebarProps = {
  deals: PublicDeal[];
  facets: FeedFacetCollections;
  communityStats: SidebarCommunityStats;
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
  const params = new URLSearchParams();
  params.set('sort', 'hot');
  params.set('category', category);

  return `/?${params.toString()}`;
}

export function FeedSidebar({ deals, facets, communityStats }: FeedSidebarProps) {
  const trendingDeals = deals.slice(0, 5);
  const topCategories = facets.categories.slice(0, 6);
  const recentActivity = deals.slice(0, 4);
  const overflowMembers = Math.max(communityStats.activeMembers - communityStats.recentMembers.length, 0);
  const formattedMemberCount = new Intl.NumberFormat('en-US').format(communityStats.activeMembers);

  return (
    <aside className="space-y-3 lg:sticky lg:top-[5.25rem] lg:self-start">
      <SidebarSection title="Trending deals">
        {trendingDeals.length ? (
          <ul className="space-y-2">
            {trendingDeals.map((deal) => (
              <li key={`trending-${deal.id}`}>
                <Link className="line-clamp-2 text-sm text-muted-foreground transition-colors hover:text-foreground" href={`/deals/${deal.id}`}>
                  {deal.title}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No trending deals yet.</p>
        )}
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

      <SidebarSection title="Latest activity">
        {recentActivity.length ? (
          <ul className="space-y-2">
            {recentActivity.map((deal) => (
              <li className="text-sm text-muted-foreground" key={`activity-${deal.id}`}>
                <Link className="transition-colors hover:text-foreground" href={`/deals/${deal.id}`}>
                  {deal.title}
                </Link>
                <p className="text-xs text-muted-foreground/80">{deal.comments_count} comments • score {deal.score}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity right now.</p>
        )}
      </SidebarSection>

      <section className="rounded-xl border border-border/70 bg-gradient-to-b from-card/60 to-card/20 p-5 shadow-[0_0_0_1px_hsl(var(--background)/0.2)_inset]">
        <h2 className="text-[2rem] font-semibold leading-tight text-foreground">{formattedMemberCount}+ active members</h2>
        <p className="mt-1 text-lg text-muted-foreground">Sharing deals from around the world</p>

        <div className="mt-5 flex items-center">
          {communityStats.recentMembers.map((member, index) => (
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
