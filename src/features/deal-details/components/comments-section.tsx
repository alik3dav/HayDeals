import type { DealComment } from '@/features/deal-details/types';
import { compactId, formatRelativeTime } from '@/features/deal-details/components/deal-utils';
import { UserAvatar } from '@/features/profile/components/user-avatar';

function getCommentAuthor(comment: DealComment) {
  const fullName = [comment.profiles?.first_name, comment.profiles?.last_name].filter(Boolean).join(' ').trim();

  return fullName || comment.profiles?.display_name || comment.profiles?.username || compactId(comment.profile_id);
}

export function CommentsSection({ comments }: { comments: DealComment[] }) {
  return (
    <section className="space-y-2 rounded-lg border border-border/60 bg-card/70 p-3">
      <h2 className="text-sm font-semibold text-foreground">Comments ({comments.length})</h2>

      {comments.length === 0 ? <p className="text-xs text-muted-foreground">No comments yet.</p> : null}

      <ul className="space-y-2">
        {comments.map((comment) => (
          <li className="rounded-md border border-border/50 bg-background/50 p-2" key={comment.id}>
            <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
              <UserAvatar avatarUrl={comment.profiles?.avatar_url} className="h-5 w-5" fallbackText={getCommentAuthor(comment)} />
              <span>{getCommentAuthor(comment)}</span>
              <span>•</span>
              <span>{formatRelativeTime(comment.created_at)}</span>
            </div>
            <p className="text-sm text-foreground">{comment.is_deleted ? '[deleted]' : comment.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
