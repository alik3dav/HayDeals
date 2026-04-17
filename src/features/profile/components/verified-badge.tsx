import { BadgeCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

export function VerifiedBadge({ className }: { className?: string }) {
  return <BadgeCheck aria-label="Verified user" className={cn('h-4 w-4 text-blue-500', className)} />;
}
