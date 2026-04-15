import { SubmitDealForm } from '@/features/submit-deal/components/submit-deal-form';
import { DashboardPageHeader } from '@/features/dashboard/components/dashboard-shared';
import { getSubmitDealMeta } from '@/features/submit-deal/queries';

export default async function SubmitDealPage() {
  const meta = await getSubmitDealMeta();

  return (
    <div className="space-y-3">
      <DashboardPageHeader
        title="Submit deal"
        description="Build a complete submission with pricing context, image support, and a clean feed preview before sending it to moderation."
      />

      <SubmitDealForm meta={meta} />
    </div>
  );
}
