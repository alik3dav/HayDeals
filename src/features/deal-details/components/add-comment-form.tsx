'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

export function AddCommentForm({
  dealId,
  onAddComment,
}: {
  dealId: string;
  onAddComment: (dealId: string, formData: FormData) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await onAddComment(dealId, formData);
          router.refresh();
        });
      }}
      className="space-y-2 rounded-lg border border-border/60 bg-card/70 p-3"
    >
      <h2 className="text-sm font-semibold text-foreground">Add comment</h2>
      <textarea
        className="min-h-20 w-full rounded-md border border-border/60 bg-background px-2 py-1.5 text-sm"
        maxLength={2000}
        name="body"
        placeholder="Share context, caveats, or your experience"
        required
      />
      <Button disabled={isPending} size="sm" type="submit">
        Post comment
      </Button>
    </form>
  );
}
