import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';

import { DASHBOARD_NAV_ITEMS } from '@/features/dashboard/navigation';
import { cn } from '@/lib/utils';

export function DashboardSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-border/70 bg-card/65 p-3">
      <div className="mb-3 flex items-center gap-2 border-b border-border/70 pb-3">
        <div className="rounded-md bg-primary/20 p-1.5 text-primary">
          <LayoutDashboard className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">User Dashboard</p>
          <p className="text-[11px] text-muted-foreground">Control center</p>
        </div>
      </div>

      <nav className="grid gap-1">
        {DASHBOARD_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
