'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Flag, Bookmark } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { VoteControls } from '@/features/deal-details/components/vote-controls';
import { applyOptimisticSave, applyOptimisticVote, type VoteState } from '@/features/deal-details/components/interaction-state';

type DealInteractionsProps = {
  dealId: string;
  dealSlug: string;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialReports: number;
  initialBookmarks: number;
  initialVote: -1 | 0 | 1;
  initiallySaved: boolean;
  voteAction: (dealId: string, dealSlug: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string, dealSlug: string) => Promise<void>;
  reportAction: (dealId: string, dealSlug: string, formData: FormData) => Promise<void>;
};

export function DealInteractions({
  dealId,
  dealSlug,
  initialScore,
  initialUpvotes,
  initialDownvotes,
  initialReports,
  initialBookmarks,
  initialVote,
  initiallySaved,
  voteAction,
  saveAction,
  reportAction,
}: DealInteractionsProps) {
  const [isPending, startTransition] = useTransition();
  const [voteState, setVoteState] = useState<VoteState>({
    vote: initialVote,
    score: initialScore,
    upvotes: initialUpvotes,
    downvotes: initialDownvotes,
  });
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [reports, setReports] = useState(initialReports);
  const [isVotePending, setIsVotePending] = useState(false);
  const [isSavePending, setIsSavePending] = useState(false);
  const voteRequestIdRef = useRef(0);
  const saveRequestIdRef = useRef(0);

  useEffect(() => {
    setVoteState({
      vote: initialVote,
      score: initialScore,
      upvotes: initialUpvotes,
      downvotes: initialDownvotes,
    });
    setIsSaved(initiallySaved);
    setBookmarks(initialBookmarks);
    setReports(initialReports);
    voteRequestIdRef.current = 0;
    saveRequestIdRef.current = 0;
    setIsVotePending(false);
    setIsSavePending(false);
  }, [dealId, initialVote, initialScore, initialUpvotes, initialDownvotes, initiallySaved, initialBookmarks, initialReports]);

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

  return (
    <section className="space-y-2 rounded-lg border border-border/60 bg-card/70 p-3">
      <VoteControls currentVote={voteState.vote} downvotes={voteState.downvotes} onVote={handleVote} score={voteState.score} upvotes={voteState.upvotes} />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          disabled={isSavePending}
          onClick={async () => {
            if (isSavePending) return;

            const previousSaved = isSaved;
            const previousBookmarks = bookmarks;
            const optimisticSave = applyOptimisticSave(isSaved, bookmarks);
            const requestId = saveRequestIdRef.current + 1;
            saveRequestIdRef.current = requestId;

            setIsSaved(optimisticSave.isSaved);
            setBookmarks(optimisticSave.bookmarks);
            setIsSavePending(true);

            try {
              await saveAction(dealId, dealSlug);
            } catch {
              if (saveRequestIdRef.current === requestId) {
                setIsSaved(previousSaved);
                setBookmarks(previousBookmarks);
              }
            } finally {
              if (saveRequestIdRef.current === requestId) {
                setIsSavePending(false);
              }
            }
          }}
          size="sm"
          variant={isSaved ? 'default' : 'secondary'}
        >
          <Bookmark className="h-3.5 w-3.5" /> {isSaved ? 'Saved' : 'Save'} ({bookmarks})
        </Button>
      </div>

      <form
        action={(formData) => {
          startTransition(async () => {
            setReports((value) => value + 1);
            try {
              await reportAction(dealId, dealSlug, formData);
            } catch {
              setReports((value) => Math.max(0, value - 1));
            }
          });
        }}
        className="space-y-2"
      >
        <input name="reason" type="hidden" value="inaccurate" />
        <textarea
          className="min-h-16 w-full rounded-md border border-border/60 bg-background px-2 py-1 text-xs text-foreground"
          name="details"
          placeholder="Report issue (optional details)"
        />
        <Button disabled={isPending} size="sm" type="submit" variant="secondary">
          <Flag className="h-3.5 w-3.5" /> Report ({reports})
        </Button>
      </form>
    </section>
  );
}
