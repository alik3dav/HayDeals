import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <PageContainer className="max-w-md">{children}</PageContainer>
    </AppShell>
  );
}
