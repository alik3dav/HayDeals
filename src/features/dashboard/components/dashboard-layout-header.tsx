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
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2">
      <div>
        <p className="text-sm font-semibold">HayDeals Dashboard</p>
        <p className="text-xs text-muted-foreground">Manage your submissions, saves, and activity</p>
      </div>

      <div className="inline-flex items-center gap-2">
        <div className="hidden items-center gap-2 lg:inline-flex">
          <UserAvatar avatarUrl={avatarUrl} className="h-7 w-7" fallbackText={resolvedName} />
          <span className="text-xs text-muted-foreground">{resolvedName}</span>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/">Public feed</Link>
        </Button>
        <form action={signOutAction}>
          <Button size="sm" variant="ghost" type="submit">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
