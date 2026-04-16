import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageContainer } from '@/components/layout/page-container';
import { getCurrentUser } from '@/lib/auth/session';
import { AddCommentForm } from '@/features/deal-details/components/add-comment-form';
import { CommentsSection } from '@/features/deal-details/components/comments-section';
import { DealHeader } from '@/features/deal-details/components/deal-header';
import { DealImageCard } from '@/features/deal-details/components/deal-image-card';
import { DealInteractions } from '@/features/deal-details/components/deal-interactions';
import { PricingSummary } from '@/features/deal-details/components/pricing-summary';
import { RelatedDeals } from '@/features/deal-details/components/related-deals';
import { getDealComments, getDealDetailBySlug, getRelatedDeals, getViewerDealState } from '@/features/deal-details/queries';
import { absoluteUrl, buildPageDescription, buildPageMetadata, getOptionalDealLocationLabel } from '@/lib/seo';

import { addCommentAction, reportDealAction, toggleSaveAction, voteOnDealAction } from './actions';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const deal = await getDealDetailBySlug(slug);

  if (!deal) {
    return buildPageMetadata({
      title: 'Deal not found',
      description: 'The requested deal could not be found.',
      pathname: `/deals/${slug}`,
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: deal.title,
    description: buildPageDescription(deal.description, `View details for ${deal.title}.`),
    pathname: `/deals/${deal.slug}`,
  });
}

export default async function DealDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const deal = await getDealDetailBySlug(slug);

  if (!deal) {
    notFound();
  }

  const [comments, relatedDeals, viewerState] = await Promise.all([
    getDealComments(deal.id),
    getRelatedDeals(deal),
    getViewerDealState(deal.id, user?.id ?? null),
  ]);
  const dealLocation = getOptionalDealLocationLabel({
    city: (deal as { location_city?: string | null }).location_city,
    region: (deal as { location_region?: string | null }).location_region,
    country: (deal as { location_country?: string | null }).location_country,
  });

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: deal.title,
    description: deal.description || undefined,
    category: deal.categories?.name || undefined,
    image: deal.image_url ? [deal.image_url] : undefined,
    url: absoluteUrl(`/deals/${deal.slug}`),
    brand: deal.stores?.name
      ? {
          '@type': 'Brand',
          name: deal.stores.name,
        }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: deal.deal_url,
      priceCurrency: deal.currency_code || undefined,
      price: deal.sale_price ?? undefined,
    },
    areaServed: dealLocation || undefined,
  };

  return (
    <PageContainer className="max-w-6xl space-y-4 py-4">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <DealHeader deal={deal} />
          <AddCommentForm canComment={Boolean(user)} dealId={deal.id} dealSlug={deal.slug} onAddComment={addCommentAction} />
          <CommentsSection comments={comments} />
          <RelatedDeals deals={relatedDeals} />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <DealImageCard deal={deal} />
          <div className="rounded-lg border border-border/60 bg-card/70 p-4">
            <PricingSummary deal={deal} />
          </div>
          <DealInteractions
            dealId={deal.id}
            dealSlug={deal.slug}
            initialBookmarks={deal.bookmarks_count}
            initialDownvotes={deal.downvotes_count}
            initialReports={deal.reports_count}
            initialScore={deal.score}
            initialUpvotes={deal.upvotes_count}
            initialVote={viewerState.currentVote}
            initiallySaved={viewerState.isSaved}
            reportAction={reportDealAction}
            saveAction={toggleSaveAction}
            voteAction={voteOnDealAction}
          />
        </aside>
      </section>
    </PageContainer>
  );
}
