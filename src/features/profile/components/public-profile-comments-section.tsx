import Link from 'next/link';

import type { PublicProfileComment } from '@/features/profile/public-profile.types';

export function PublicProfileCommentsSection({ comments }: { comments: PublicProfileComment[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/60 bg-card/70 p-4">
      <h2 className="text-base font-semibold text-foreground">Recent comments</h2>

      {comments.length === 0 ? <p className="text-sm text-muted-foreground">No public comments yet.</p> : null}

      <ul className="space-y-2">
        {comments.map((comment) => (
          <li className="rounded-lg border border-border/50 bg-background/40 p-3" key={comment.id}>
            <p className="line-clamp-3 text-sm text-foreground">{comment.body}</p>
            <Link className="mt-2 inline-block text-xs text-primary hover:underline" href={`/deals/${comment.deal.id}`}>
              View on {comment.deal.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
