import type { Metadata } from 'next';

import { PageContainer } from '@/components/layout/page-container';
import { DealFeedList } from '@/features/deals/components/deal-feed-list';
import { FeedSidebar } from '@/features/deals/components/feed-sidebar';
import { FeedSortSubheader } from '@/features/deals/components/feed-sort-subheader';
import { getFeedFacets, getPublicDealsFeed, getSidebarCommunityStats, parseFeedQueryParams } from '@/features/deals/queries';
import type { FeedFacetCollections, SidebarCommunityStats } from '@/features/deals/types';
import { SITE_NAME, absoluteUrl, buildPageMetadata } from '@/lib/seo';

const EMPTY_FACETS: FeedFacetCollections = {
  categories: [],
  stores: [],
  dealTypes: [],
};

const EMPTY_COMMUNITY_STATS: SidebarCommunityStats = {
  activeMembers: 0,
  recentMembers: [],
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const { filters, sort } = parseFeedQueryParams(resolvedParams);

  const titleParts = ['Latest Deals'];

  if (filters.query) titleParts.unshift(`Search: ${filters.query}`);
  if (filters.category) titleParts.unshift(`Category: ${filters.category}`);
  if (filters.store) titleParts.unshift(`Store: ${filters.store}`);
  if (sort !== 'newest') titleParts.push(`Sort: ${sort}`);

  const canonicalQuery = new URLSearchParams();
  if (filters.query) canonicalQuery.set('q', filters.query);
  if (filters.category) canonicalQuery.set('category', filters.category);
  if (filters.store) canonicalQuery.set('store', filters.store);
  if (filters.dealType) canonicalQuery.set('dealType', filters.dealType);
  if (sort !== 'newest') canonicalQuery.set('sort', sort);

  return buildPageMetadata({
    title: titleParts.join(' | '),
    description: 'Browse verified community deals, discounts, and price drops.',
    pathname: canonicalQuery.size ? `/?${canonicalQuery.toString()}` : '/',
  });
}

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const { sort, cursor, filters } = parseFeedQueryParams(resolvedParams);

  let facets = EMPTY_FACETS;
  let communityStats = EMPTY_COMMUNITY_STATS;
  let deals: Awaited<ReturnType<typeof getPublicDealsFeed>> = { items: [], hasMore: false, nextCursor: null };
  let trendingDeals: Awaited<ReturnType<typeof getPublicDealsFeed>>['items'] = [];
  let loadError = false;

  const [facetsResult, dealsResult, trendingDealsResult, communityStatsResult] = await Promise.allSettled([
    getFeedFacets(),
    getPublicDealsFeed({ sort, cursor, filters }),
    getPublicDealsFeed({ sort: 'hot', filters, pageSize: 5 }),
    getSidebarCommunityStats(),
  ]);

  if (facetsResult.status === 'fulfilled') {
    facets = facetsResult.value;
  }

  if (dealsResult.status === 'fulfilled') {
    deals = dealsResult.value;
  } else {
    loadError = true;
  }

  if (trendingDealsResult.status === 'fulfilled') {
    trendingDeals = trendingDealsResult.value.items;
  }

  if (communityStatsResult.status === 'fulfilled') {
    communityStats = communityStatsResult.value;
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_NAME} - Latest Deals`,
    url: absoluteUrl('/'),
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: deals.items.map((deal, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/deals/${deal.slug}`),
        name: deal.title,
      })),
    },
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      <FeedSortSubheader filters={filters} sort={sort} />

      <PageContainer className="space-y-4">
        {loadError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We&apos;re having trouble loading deals right now. Please try again in a moment.
          </p>
        ) : null}

        <main className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <h1 className="sr-only">Latest deals and discounts</h1>
            <DealFeedList deals={deals.items} filters={filters} hasMore={deals.hasMore} nextCursor={deals.nextCursor} sort={sort} />
          </section>

          <FeedSidebar trendingDeals={trendingDeals} recentActivityDeals={deals.items} facets={facets} communityStats={communityStats} />
        </main>
      </PageContainer>
    </>
  );
}
