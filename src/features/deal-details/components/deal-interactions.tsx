'use client';

import { useState, useTransition } from 'react';
import { Flag, Bookmark } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { VoteControls } from '@/features/deal-details/components/vote-controls';

type DealInteractionsProps = {
  dealId: string;
  initialScore: number;
  initialUpvotes: number;
  initialDownvotes: number;
  initialReports: number;
  initialBookmarks: number;
  initialVote: -1 | 0 | 1;
  initiallySaved: boolean;
  voteAction: (dealId: string, voteValue: 1 | -1) => Promise<void>;
  saveAction: (dealId: string) => Promise<void>;
  reportAction: (dealId: string, formData: FormData) => Promise<void>;
};

export function DealInteractions({
  dealId,
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
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [vote, setVote] = useState<-1 | 0 | 1>(initialVote);
  const [score, setScore] = useState(initialScore);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [bookmarks, setBookmarks] = useState(initialBookmarks);
  const [reports, setReports] = useState(initialReports);

  const handleVote = async (nextVote: 1 | -1) => {
    const prevVote = vote;

    let scoreDelta = 0;
    let upvoteDelta = 0;
    let downvoteDelta = 0;

    if (prevVote === nextVote) {
      scoreDelta = -nextVote;
      if (nextVote === 1) upvoteDelta = -1;
      if (nextVote === -1) downvoteDelta = -1;
      setVote(0);
    } else if (prevVote === 0) {
      scoreDelta = nextVote;
      if (nextVote === 1) upvoteDelta = 1;
      if (nextVote === -1) downvoteDelta = 1;
      setVote(nextVote);
    } else {
      scoreDelta = nextVote * 2;
      if (nextVote === 1) {
        upvoteDelta = 1;
        downvoteDelta = -1;
      } else {
        upvoteDelta = -1;
        downvoteDelta = 1;
      }
      setVote(nextVote);
    }

    setScore((value) => value + scoreDelta);
    setUpvotes((value) => Math.max(0, value + upvoteDelta));
    setDownvotes((value) => Math.max(0, value + downvoteDelta));

    try {
      await voteAction(dealId, nextVote);
      router.refresh();
    } catch {
      setVote(prevVote);
      setScore((value) => value - scoreDelta);
      setUpvotes((value) => Math.max(0, value - upvoteDelta));
      setDownvotes((value) => Math.max(0, value - downvoteDelta));
    }
  };

  return (
    <section className="space-y-2 rounded-lg border border-border/60 bg-card/70 p-3">
      <VoteControls currentVote={vote} downvotes={downvotes} onVote={handleVote} score={score} upvotes={upvotes} />

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Button
          disabled={isPending}
          onClick={() =>
            startTransition(async () => {
              const nextSaved = !isSaved;
              setIsSaved(nextSaved);
              setBookmarks((value) => Math.max(0, value + (nextSaved ? 1 : -1)));

              try {
                await saveAction(dealId);
                router.refresh();
              } catch {
                setIsSaved(!nextSaved);
                setBookmarks((value) => Math.max(0, value + (nextSaved ? -1 : 1)));
              }
            })
          }
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
              await reportAction(dealId, formData);
              router.refresh();
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
