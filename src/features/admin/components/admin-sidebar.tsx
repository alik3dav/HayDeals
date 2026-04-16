import Link from 'next/link';
import { AlertTriangle, ClipboardList, Home, ImageIcon, LayoutGrid, Palette, ShoppingBag, Store, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/deals', label: 'Deals Queue', icon: ShoppingBag },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/admin/stores', label: 'Stores', icon: Store },
  { href: '/admin/users', label: 'Users & Roles', icon: Users },
  { href: '/admin/website-control', label: 'Website control', icon: Palette },
  { href: '/admin/ad-control', label: 'Ad control', icon: ImageIcon },
];

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-border/70 bg-card/70 p-3">
      <div className="mb-3 flex items-center gap-2 border-b border-border/70 pb-3">
        <div className="rounded-md bg-primary/20 p-1.5 text-primary">
          <ClipboardList className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">Admin Console</p>
          <p className="text-[11px] text-muted-foreground">Operations</p>
        </div>
      </div>
      <nav className="grid gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && 'bg-accent text-accent-foreground',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-border/70 pt-3">
        <Link
          className="inline-flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          href="/"
        >
          Back to public site
        </Link>
      </div>
    </aside>
  );
}
