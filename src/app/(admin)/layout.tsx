import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { AdminSidebarShell } from '@/features/admin/components/admin-sidebar-shell';
import { requireRole } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(['moderator', 'admin']);

  return (
    <AppShell>
      <PageContainer>
        <div className="grid gap-4 md:grid-cols-[220px_1fr]">
          <AdminSidebarShell />
          <div>{children}</div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
