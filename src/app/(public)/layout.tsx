import type { ReactNode } from 'react';

import { AppShell } from '@/components/layout/app-shell';
import { PublicFooter } from '@/components/layout/public-footer';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      {children}
      <PublicFooter />
    </AppShell>
  );
}
