import type { ReactNode } from 'react';

import { HeaderShell } from '@/components/layout/header-shell';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderShell />
      {children}
    </div>
  );
}
