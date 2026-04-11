import { AdminPageHeader } from '@/features/admin/components/admin-page-header';
import { DealsQueueTable } from '@/features/admin/components/deals-queue-table';
import { getDealsReviewQueue } from '@/features/admin/queries';

export default async function AdminDealsPage() {
  const deals = await getDealsReviewQueue();

  return (
    <div className="space-y-4">
      <AdminPageHeader title="Deals review queue" description="Approve, reject, feature, or edit submitted deals." />
      <DealsQueueTable deals={deals} />
    </div>
  );
}
