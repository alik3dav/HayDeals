import { SubmitDealForm } from '@/features/submit-deal/components/submit-deal-form';
import { getSubmitDealMeta } from '@/features/submit-deal/queries';

export default async function SubmitDealPage() {
  const meta = await getSubmitDealMeta();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Create Deal</p>
        <h1 className="text-2xl font-semibold tracking-tight">Submit a deal</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">Build a complete submission with pricing context, image support, and a clean feed preview before sending it to moderation.</p>
      </header>

      <SubmitDealForm meta={meta} />
    </div>
  );
}
