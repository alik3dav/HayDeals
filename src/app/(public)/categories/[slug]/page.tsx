import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PageContainer } from '@/components/layout/page-container';
import { DealFeedList } from '@/features/deals/components/deal-feed-list';
import { FeedSidebar } from '@/features/deals/components/feed-sidebar';
import { FeedSortSubheader } from '@/features/deals/components/feed-sort-subheader';
import { feedSidebarAd } from '@/features/deals/components/sidebar-ad-data';
import type { SidebarAd } from '@/features/deals/components/sidebar-ad-module';
import { getFeedFacets, getPublicDealsFeed, getSidebarCommunityStats, parseFeedQueryParams } from '@/features/deals/queries';
import type { FeedFacetCollections, SidebarCommunityStats } from '@/features/deals/types';
import { createClient } from '@/lib/supabase/server';
import { absoluteUrl, buildPageMetadata } from '@/lib/seo';

const EMPTY_FACETS: FeedFacetCollections = {
  categories: [],
  stores: [],
  dealTypes: [],
  availabilityRegions: [],
  availabilityCountries: [],
};

const EMPTY_COMMUNITY_STATS: SidebarCommunityStats = {
  activeMembers: 0,
  recentMembers: [],
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const facets = await getFeedFacets().catch(() => EMPTY_FACETS);
  const category = facets.categories.find((entry) => entry.value === slug);

  if (!category) {
    return buildPageMetadata({
      title: 'Category Not Found',
      description: 'The requested category does not exist.',
      pathname: '/categories',
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: `${category.label} Deals`,
    description: `Browse the latest community-submitted deals in ${category.label}.`,
    pathname: `/categories/${encodeURIComponent(category.value)}`,
  });
}

export default async function CategoryDealsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const resolvedParams = await searchParams;
  const parsed = parseFeedQueryParams(resolvedParams);
  const sort = parsed.sort;
  const cursor = parsed.cursor;
  const filters = { ...parsed.filters, category: slug };

  let facets = EMPTY_FACETS;
  let communityStats = EMPTY_COMMUNITY_STATS;
  let deals: Awaited<ReturnType<typeof getPublicDealsFeed>> = { items: [], hasMore: false, nextCursor: null };
  let trendingDeals: Awaited<ReturnType<typeof getPublicDealsFeed>>['items'] = [];
  let sidebarAd: SidebarAd = feedSidebarAd;
  let loadError = false;
  const supabase = await createClient();

  const [facetsResult, dealsResult, trendingDealsResult, communityStatsResult, sidebarAdResult] = await Promise.allSettled([
    getFeedFacets(),
    getPublicDealsFeed({ sort, cursor, filters }),
    getPublicDealsFeed({ sort: 'hot', filters, pageSize: 5 }),
    getSidebarCommunityStats(),
    supabase
      .from('website_control_settings')
      .select('sidebar_ad_background_image_url, sidebar_ad_title, sidebar_ad_description, sidebar_ad_button_text, sidebar_ad_href, sidebar_ad_image_only')
      .eq('id', 1)
      .maybeSingle(),
  ]);

  if (facetsResult.status === 'fulfilled') {
    facets = facetsResult.value;
  }

  const category = facets.categories.find((entry) => entry.value === slug);
  if (!category) {
    notFound();
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

  if (sidebarAdResult.status === 'fulfilled') {
    const settings = sidebarAdResult.value.data;

    if (settings) {
      sidebarAd = {
        ...feedSidebarAd,
        title: settings.sidebar_ad_title ?? feedSidebarAd.title,
        description: settings.sidebar_ad_description ?? feedSidebarAd.description,
        ctaLabel: settings.sidebar_ad_button_text ?? feedSidebarAd.ctaLabel,
        href: settings.sidebar_ad_href ?? feedSidebarAd.href,
        backgroundImageUrl: settings.sidebar_ad_background_image_url ?? undefined,
        imageOnly: settings.sidebar_ad_image_only ?? false,
      };
    }
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${category.label} Deals`,
    url: absoluteUrl(`/categories/${category.value}`),
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
        <header className="rounded-xl border border-border/70 bg-card/30 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Category archive</p>
          <h1 className="mt-1 text-xl font-semibold text-foreground">{category.label} deals</h1>
          <p className="mt-1 text-sm text-muted-foreground">Latest and highest-rated offers in {category.label}.</p>
          <Link className="mt-3 inline-block text-sm font-medium text-primary hover:underline" href="/categories">
            View all categories
          </Link>
        </header>

        {loadError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We&apos;re having trouble loading deals right now. Please try again in a moment.
          </p>
        ) : null}

        <main className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <DealFeedList deals={deals.items} filters={filters} hasMore={deals.hasMore} nextCursor={deals.nextCursor} sort={sort} />
          </section>

          <FeedSidebar trendingDeals={trendingDeals} facets={facets} communityStats={communityStats} sidebarAd={sidebarAd} />
        </main>
      </PageContainer>
    </>
  );
}
