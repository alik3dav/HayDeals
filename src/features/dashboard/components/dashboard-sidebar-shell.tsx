'use client';

import { usePathname } from 'next/navigation';

import { DashboardSidebar } from '@/features/dashboard/components/dashboard-sidebar';

export function DashboardSidebarShell() {
  const pathname = usePathname();

  return <DashboardSidebar pathname={pathname} />;
}
