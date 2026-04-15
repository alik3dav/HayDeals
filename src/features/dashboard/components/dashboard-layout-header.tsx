import Link from 'next/link';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function DashboardLayoutHeader({ userEmail, signOutAction }: { userEmail?: string; signOutAction: () => Promise<void> }) {
  return (
    <header className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-card/60 px-3 py-2">
      <div>
        <p className="text-sm font-semibold">HayDeals Dashboard</p>
        <p className="text-xs text-muted-foreground">Manage your submissions, saves, and activity</p>
      </div>

      <div className="inline-flex items-center gap-2">
        {userEmail ? <span className="hidden text-xs text-muted-foreground lg:inline">{userEmail}</span> : null}
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
