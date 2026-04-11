import Link from 'next/link';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/deals', label: 'Deals Queue' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/stores', label: 'Stores' },
  { href: '/admin/users', label: 'Users & Roles' },
  { href: '/admin/reports', label: 'Reports' },
];

export function AdminSidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="rounded-lg border bg-card p-2">
      <nav className="grid gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              (pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))) && 'bg-accent text-accent-foreground',
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
