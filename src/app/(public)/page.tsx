import { PageContainer } from '@/components/layout/page-container';
import { DealFeedList } from '@/features/deals/components/deal-feed-list';
import { FeedFilters } from '@/features/deals/components/feed-filters';
import { getFeedFacets, getPublicDealsFeed, parseFeedQueryParams } from '@/features/deals/queries';

export default async function PublicHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const { sort, cursor, filters } = parseFeedQueryParams(resolvedParams);

  const [facets, feed] = await Promise.all([getFeedFacets(), getPublicDealsFeed({ sort, cursor, filters })]);

  return (
    <PageContainer className="max-w-5xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Community deals</h1>
        <p className="text-sm text-muted-foreground">Fresh finds from the community — sorted your way.</p>
      </header>

      <FeedFilters facets={facets} filters={filters} sort={sort} />

      <DealFeedList deals={feed.items} filters={filters} hasMore={feed.hasMore} nextCursor={feed.nextCursor} sort={sort} />
    </PageContainer>
  );
}
