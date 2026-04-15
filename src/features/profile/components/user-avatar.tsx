import { cn } from '@/lib/utils';

type UserAvatarProps = {
  avatarUrl?: string | null;
  fallbackText: string;
  className?: string;
  textClassName?: string;
};

export function getInitials(input: string) {
  const parts = input
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return 'U';
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

export function UserAvatar({ avatarUrl, fallbackText, className, textClassName }: UserAvatarProps) {
  const initials = getInitials(fallbackText);

  return (
    <span className={cn('inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted', className)}>
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img alt={`${fallbackText} avatar`} className="h-full w-full object-cover" src={avatarUrl} />
      ) : (
        <span className={cn('text-[11px] font-semibold text-foreground', textClassName)}>{initials}</span>
      )}
    </span>
  );
}
