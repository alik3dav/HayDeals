import Link from 'next/link';
import type { ReactNode } from 'react';

import type { FeedFacetCollections, PublicDeal } from '@/features/deals/types';

type FeedSidebarProps = {
  deals: PublicDeal[];
  facets: FeedFacetCollections;
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

export function FeedSidebar({ deals, facets }: FeedSidebarProps) {
  const trendingDeals = deals.slice(0, 5);
  const topCategories = facets.categories.slice(0, 6);
  const recentActivity = deals.slice(0, 4);

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

      <SidebarSection title="Community stats">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Visible deals</dt>
            <dd className="text-base font-semibold text-foreground">{deals.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Categories</dt>
            <dd className="text-base font-semibold text-foreground">{facets.categories.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Stores</dt>
            <dd className="text-base font-semibold text-foreground">{facets.stores.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Deal types</dt>
            <dd className="text-base font-semibold text-foreground">{facets.dealTypes.length}</dd>
          </div>
        </dl>
      </SidebarSection>
    </aside>
  );
}
