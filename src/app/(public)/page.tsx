import { PageContainer } from '@/components/layout/page-container';
import { DealFeedList } from '@/features/deals/components/deal-feed-list';
import { FeedFilters } from '@/features/deals/components/feed-filters';
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

  try {
    [facets, deals] = await Promise.all([getFeedFacets(), getPublicDealsFeed({ sort, cursor, filters })]);
  } catch (error) {
    loadError = true;
    console.error('Failed to load public feed data.', error);
  }

  return (
    <PageContainer className="max-w-5xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Community deals</h1>
        <p className="text-sm text-muted-foreground">Fresh finds from the community — sorted your way.</p>
      </header>

      {loadError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          We&apos;re having trouble loading deals right now. Please try again in a moment.
        </p>
      ) : null}

      <FeedFilters facets={facets} filters={filters} sort={sort} />

      <DealFeedList deals={deals.items} filters={filters} hasMore={deals.hasMore} nextCursor={deals.nextCursor} sort={sort} />
    </PageContainer>
  );
}
