import { PageContainer } from '@/components/layout/page-container';
import { DealFeedList } from '@/features/deals/components/deal-feed-list';
import { FeedSidebar } from '@/features/deals/components/feed-sidebar';
import { FeedSortSubheader } from '@/features/deals/components/feed-sort-subheader';
import { getFeedFacets, getPublicDealsFeed, parseFeedQueryParams } from '@/features/deals/queries';
import type { FeedFacetCollections } from '@/features/deals/types';

const EMPTY_FACETS: FeedFacetCollections = {
  categories: [],
  stores: [],
  dealTypes: [],
};

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const { sort, cursor, filters } = parseFeedQueryParams(resolvedParams);

  let facets = EMPTY_FACETS;
  let deals: Awaited<ReturnType<typeof getPublicDealsFeed>> = { items: [], hasMore: false, nextCursor: null };
  let loadError = false;

  const [facetsResult, dealsResult] = await Promise.allSettled([
    getFeedFacets(),
    getPublicDealsFeed({ sort, cursor, filters }),
  ]);

  if (facetsResult.status === 'fulfilled') {
    facets = facetsResult.value;
  } else {
    console.error('Failed to load feed facets.', facetsResult.reason);
  }

  if (dealsResult.status === 'fulfilled') {
    deals = dealsResult.value;
  } else {
    loadError = true;
    console.error('Failed to load public deals feed.', dealsResult.reason);
  }

  return (
    <>
      <FeedSortSubheader filters={filters} sort={sort} />

      <PageContainer className="space-y-4">
        {loadError ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            We&apos;re having trouble loading deals right now. Please try again in a moment.
          </p>
        ) : null}

        <main className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section>
            <DealFeedList deals={deals.items} filters={filters} hasMore={deals.hasMore} nextCursor={deals.nextCursor} sort={sort} />
          </section>

          <FeedSidebar deals={deals.items} facets={facets} />
        </main>
      </PageContainer>
    </>
  );
}
