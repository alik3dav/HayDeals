import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <PageContainer>{children}</PageContainer>
    </AppShell>
  );
}
