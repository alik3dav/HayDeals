import { notFound } from 'next/navigation';

import { PageContainer } from '@/components/layout/page-container';
import { getCurrentUser } from '@/lib/auth/session';
import { AddCommentForm } from '@/features/deal-details/components/add-comment-form';
import { CommentsSection } from '@/features/deal-details/components/comments-section';
import { DealHeader } from '@/features/deal-details/components/deal-header';
import { DealInteractions } from '@/features/deal-details/components/deal-interactions';
import { PricingSummary } from '@/features/deal-details/components/pricing-summary';
import { RelatedDeals } from '@/features/deal-details/components/related-deals';
import { getDealComments, getDealDetailById, getRelatedDeals, getViewerDealState } from '@/features/deal-details/queries';

import { addCommentAction, reportDealAction, toggleSaveAction, voteOnDealAction } from './actions';

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const deal = await getDealDetailById(id);

  if (!deal) {
    notFound();
  }

  const [comments, relatedDeals, viewerState] = await Promise.all([
    getDealComments(id),
    getRelatedDeals(deal),
    getViewerDealState(id, user?.id ?? null),
  ]);

  return (
    <PageContainer className="max-w-6xl space-y-4 py-4">
      <DealHeader deal={deal} />

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <AddCommentForm canComment={Boolean(user)} dealId={deal.id} onAddComment={addCommentAction} />
          <CommentsSection comments={comments} />
          <RelatedDeals deals={relatedDeals} />
        </div>

        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border border-border/60 bg-card/70 p-4">
            <PricingSummary deal={deal} />
          </div>
          <DealInteractions
            dealId={deal.id}
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
