import { cn } from '@/lib/utils';

import { VerifiedBadge } from '@/features/profile/components/verified-badge';

type ProfileDisplayNameProps = {
  name: string;
  isVerified: boolean | null | undefined;
  className?: string;
  iconClassName?: string;
};

export function ProfileDisplayName({ name, isVerified, className, iconClassName }: ProfileDisplayNameProps) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="truncate">{name}</span>
      {isVerified ? <VerifiedBadge className={iconClassName} /> : null}
    </span>
  );
}
