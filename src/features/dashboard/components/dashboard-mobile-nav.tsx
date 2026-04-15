'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { DASHBOARD_NAV_ITEMS } from '@/features/dashboard/navigation';
import { cn } from '@/lib/utils';

export function DashboardMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-3 flex gap-2 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-2 md:hidden">
      {DASHBOARD_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground',
              isActive && 'bg-accent text-accent-foreground',
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
