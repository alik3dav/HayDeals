'use client';

import { usePathname } from 'next/navigation';

import { AdminSidebar } from '@/features/admin/components/admin-sidebar';

export function AdminSidebarShell() {
  const pathname = usePathname();
  return <AdminSidebar pathname={pathname} />;
}
