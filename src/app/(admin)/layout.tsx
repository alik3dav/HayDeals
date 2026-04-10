import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { requireRole } from '@/lib/auth/session';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole(['moderator', 'admin']);

  return (
    <AppShell>
      <PageContainer>{children}</PageContainer>
    </AppShell>
  );
}
