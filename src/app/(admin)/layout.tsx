import type { ReactNode } from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

import { AdminSidebarShell } from '@/features/admin/components/admin-sidebar-shell';
import { requireRole } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { user, role } = await requireRole(['moderator', 'admin']);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1440px] px-3 py-3 md:px-4 md:py-4">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3 py-2">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">HayDeals Admin</p>
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] uppercase text-muted-foreground">{role}</span>
          </div>
          <div className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span className="hidden md:inline">{user.email}</span>
            <Link className="rounded-md border border-border/70 px-2 py-1 hover:bg-accent hover:text-accent-foreground" href="/">
              View site
            </Link>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[240px_1fr]">
          <AdminSidebarShell />
          <div className="rounded-xl border border-border/70 bg-card/40 p-3 md:p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
