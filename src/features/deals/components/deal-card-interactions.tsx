'use client';

import { useState, useTransition } from 'react';
import { Bookmark, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

type DealCardInteractionsProps = {
  dealId: string;
  initialLikeCount: number;
  initialVote: -1 | 0 | 1;
  initiallySaved: boolean;
  voteAction: (dealId: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string) => Promise<void>;
};

export function DealCardInteractions({ dealId, initialLikeCount, initialVote, initiallySaved, voteAction, saveAction }: DealCardInteractionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [vote, setVote] = useState<-1 | 0 | 1>(initialVote);
  const [isSaved, setIsSaved] = useState(initiallySaved);

  const handleVote = (nextVote: 1 | -1) => {
    startTransition(async () => {
      const previousVote = vote;
      let likeDelta = 0;

      if (previousVote === nextVote) {
        setVote(0);
        likeDelta = nextVote === 1 ? -1 : 0;
      } else if (previousVote === 0) {
        setVote(nextVote);
        likeDelta = nextVote === 1 ? 1 : 0;
      } else {
        setVote(nextVote);
        likeDelta = nextVote === 1 ? 1 : -1;
      }

      setLikeCount((currentLikeCount) => Math.max(0, currentLikeCount + likeDelta));

      try {
        await voteAction(dealId, nextVote);
        router.refresh();
      } catch {
        setVote(previousVote);
        setLikeCount((currentLikeCount) => Math.max(0, currentLikeCount - likeDelta));
      }
    });
  };

  const handleSave = () => {
    startTransition(async () => {
      const nextSavedValue = !isSaved;
      setIsSaved(nextSavedValue);

      try {
        await saveAction(dealId);
        router.refresh();
      } catch {
        setIsSaved(!nextSavedValue);
      }
    });
  };

  return (
    <>
      <div className="ml-auto flex items-center gap-2.5 text-emerald-600">
        <div className="flex items-center justify-between gap-2 rounded-full border border-[#252C3A] bg-[#191d25] px-1 py-1">
          <button
            aria-label="Upvote deal"
            className="inline-flex items-center rounded-full p-2 transition-colors hover:bg-emerald-500/15"
            disabled={isPending}
            onClick={() => handleVote(1)}
            type="button"
          >
            <ThumbsUp className={`h-4 w-4 ${vote === 1 ? 'fill-current text-emerald-400' : ''}`} />
          </button>
          <span className="text-base font-semibold">{likeCount}</span>
          <button
            aria-label="Downvote deal"
            className="inline-flex items-center rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-500/15"
            disabled={isPending}
            onClick={() => handleVote(-1)}
            type="button"
          >
            <ThumbsDown className={`h-4 w-4 ${vote === -1 ? 'fill-current text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      <Button
        aria-label="Save deal"
        className="h-10 w-10 shrink-0 rounded-full border border-border bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
        disabled={isPending}
        onClick={handleSave}
        size="icon"
        variant={isSaved ? 'default' : 'ghost'}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>
    </>
  );
}
