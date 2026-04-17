import Link from 'next/link';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/features/profile/components/user-avatar';

export function DashboardLayoutHeader({
  userEmail,
  displayName,
  avatarUrl,
  signOutAction,
}: {
  userEmail?: string;
  displayName?: string;
  avatarUrl?: string | null;
  signOutAction: () => Promise<void>;
}) {
  const resolvedName = displayName || userEmail || 'User';

  return (
    <aside className="flex flex-col gap-3 rounded-xl border border-border/70 bg-card/60 p-3">
      <div className="flex items-center gap-2">
        <UserAvatar avatarUrl={avatarUrl} className="h-8 w-8" fallbackText={resolvedName} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{resolvedName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
        </div>
      </div>
      <div className="grid gap-2">
        <Button asChild className="w-full justify-start" size="sm" variant="outline">
          <Link href="/">Public feed</Link>
        </Button>
        <form action={signOutAction}>
          <Button className="w-full justify-start" size="sm" variant="ghost" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </aside>
  );
}
