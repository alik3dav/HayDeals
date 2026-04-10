'use client';

import { useTransition } from 'react';
import { ArrowBigDown, ArrowBigUp } from 'lucide-react';

import { Button } from '@/components/ui/button';

type VoteControlsProps = {
  upvotes: number;
  downvotes: number;
  score: number;
  currentVote: -1 | 0 | 1;
  onVote: (voteValue: 1 | -1) => Promise<void>;
};

export function VoteControls({ upvotes, downvotes, score, currentVote, onVote }: VoteControlsProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/70 p-2">
      <Button
        aria-label="Upvote"
        disabled={isPending}
        onClick={() => startTransition(async () => onVote(1))}
        size="sm"
        variant={currentVote === 1 ? 'default' : 'secondary'}
      >
        <ArrowBigUp className="h-4 w-4" /> {upvotes}
      </Button>
      <Button
        aria-label="Downvote"
        disabled={isPending}
        onClick={() => startTransition(async () => onVote(-1))}
        size="sm"
        variant={currentVote === -1 ? 'destructive' : 'secondary'}
      >
        <ArrowBigDown className="h-4 w-4" /> {downvotes}
      </Button>
      <span className="ml-1 text-xs font-semibold text-muted-foreground">Score: {score}</span>
    </div>
  );
}
