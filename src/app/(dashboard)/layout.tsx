import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { signOutAction } from '@/app/(auth)/actions';
import { DashboardLayoutHeader } from '@/features/dashboard/components/dashboard-layout-header';
import { DashboardMobileNav } from '@/features/dashboard/components/dashboard-mobile-nav';
import { DashboardSidebarShell } from '@/features/dashboard/components/dashboard-sidebar-shell';
import { getUserIdentity } from '@/features/profile/queries';
import { requireUser } from '@/lib/auth/session';


export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const identity = await getUserIdentity(user.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-3 py-3 md:px-4 md:py-4">
        <DashboardLayoutHeader
          avatarUrl={identity?.avatarUrl}
          displayName={identity?.displayName}
          signOutAction={signOutAction}
          userEmail={user.email}
        />
        <DashboardMobileNav />
        <div className="grid gap-3 md:grid-cols-[240px_1fr]">
          <div className="hidden md:block">
            <DashboardSidebarShell />
          </div>
          <main className="rounded-xl border border-border/70 bg-card/45 p-3 md:p-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
