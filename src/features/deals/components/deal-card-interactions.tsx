'use client';

import { useEffect, useRef, useState } from 'react';
import { Bookmark, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { applyOptimisticSave, applyOptimisticVote, type VoteState } from '@/features/deal-details/components/interaction-state';

type DealCardInteractionsProps = {
  dealId: string;
  dealSlug: string;
  initialLikeCount: number;
  initialVote: -1 | 0 | 1;
  initiallySaved: boolean;
  voteAction: (dealId: string, dealSlug: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string, dealSlug: string) => Promise<void>;
};

export function DealCardInteractions({ dealId, dealSlug, initialLikeCount, initialVote, initiallySaved, voteAction, saveAction }: DealCardInteractionsProps) {
  const [voteState, setVoteState] = useState<VoteState>({
    vote: initialVote,
    score: initialLikeCount,
    upvotes: initialLikeCount,
    downvotes: 0,
  });
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [isVotePending, setIsVotePending] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);
  const voteRequestIdRef = useRef(0);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    setVoteState({
      vote: initialVote,
      score: initialLikeCount,
      upvotes: initialLikeCount,
      downvotes: 0,
    });
    setIsSaved(initiallySaved);
    voteRequestIdRef.current = 0;
    saveRequestIdRef.current = 0;
    setIsVotePending(false);
    setIsSavePending(false);
  }, [dealId, initialLikeCount, initialVote, initiallySaved]);

  const handleVote = async (nextVote: 1 | -1) => {
    if (isVotePending) return;

    const previousState = voteState;
    const optimisticState = applyOptimisticVote(voteState, nextVote);
    const requestId = voteRequestIdRef.current + 1;
    voteRequestIdRef.current = requestId;

    setVoteState(optimisticState);
    setIsVotePending(true);

    try {
      await voteAction(dealId, dealSlug, nextVote);
    } catch {
      if (voteRequestIdRef.current === requestId) {
        setVoteState(previousState);
      }
    } finally {
      if (voteRequestIdRef.current === requestId) {
        setIsVotePending(false);
      }
    }
  };

  const handleSave = async () => {
    if (isSavePending) return;

    const previousSaved = isSaved;
    const optimisticSave = applyOptimisticSave(isSaved, 0);
    const requestId = saveRequestIdRef.current + 1;
    saveRequestIdRef.current = requestId;

    setIsSaved(optimisticSave.isSaved);
    setIsSavePending(true);

    try {
      await saveAction(dealId, dealSlug);
    } catch {
      if (saveRequestIdRef.current === requestId) {
        setIsSaved(previousSaved);
      }
    } finally {
      if (saveRequestIdRef.current === requestId) {
        setIsSavePending(false);
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 text-emerald-600">
        <div className="flex items-center justify-between gap-2 rounded-full border-border bg-secondary/70 px-1 py-1">
          <button
            aria-label="Upvote deal"
            className="inline-flex items-center rounded-full p-2 transition-colors hover:bg-primary/10"
            disabled={isVotePending}
            onClick={() => handleVote(1)}
            type="button"
          >
            <ThumbsUp className={`h-4 w-4 ${voteState.vote === 1 ? 'fill-current text-primary' : ''}`} />
          </button>
          <span className="text-base font-primary text-primary">{voteState.upvotes}</span>
          <button
            aria-label="Downvote deal"
            className="inline-flex items-center rounded-full p-2 text-rose-500 transition-colors hover:bg-rose-500/15"
            disabled={isVotePending}
            onClick={() => handleVote(-1)}
            type="button"
          >
            <ThumbsDown className={`h-4 w-4 ${voteState.vote === -1 ? 'fill-current text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      <Button
        aria-label="Save deal"
        className="absolute right-3 top-3 z-10 h-9 w-9 shrink-0 rounded-full border border-border bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground md:right-4 md:top-4 md:h-10 md:w-10"
        disabled={isSavePending}
        onClick={handleSave}
        size="icon"
        variant={isSaved ? 'default' : 'ghost'}
      >
        <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
      </Button>

     
    </>
  );
}
