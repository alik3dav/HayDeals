import { SubmitDealForm } from '@/features/submit-deal/components/submit-deal-form';
import { getSubmitDealMeta } from '@/features/submit-deal/queries';

export default async function SubmitDealPage() {
  const meta = await getSubmitDealMeta();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">Submit a deal</h1>
        <p className="text-sm text-muted-foreground">Add a high-quality deal, save as draft, or submit for community moderation.</p>
      </header>

      <SubmitDealForm meta={meta} />
    </div>
  );
}
