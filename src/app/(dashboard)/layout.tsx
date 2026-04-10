import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { requireUser } from '@/lib/auth/session';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  await requireUser();

  return (
    <AppShell>
      <PageContainer>{children}</PageContainer>
    </AppShell>
  );
}
