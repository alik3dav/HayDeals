import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <PageContainer className="max-w-md">{children}</PageContainer>
    </AppShell>
  );
}
