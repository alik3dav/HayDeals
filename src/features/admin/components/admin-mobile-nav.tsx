'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, Home, ImageIcon, LayoutGrid, Palette, ShoppingBag, Store, Users } from 'lucide-react';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: Home },
  { href: '/admin/deals', label: 'Deals', icon: ShoppingBag },
  { href: '/admin/reports', label: 'Reports', icon: AlertTriangle },
  { href: '/admin/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/admin/stores', label: 'Stores', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/website-control', label: 'Website', icon: Palette },
  { href: '/admin/ad-control', label: 'Ads', icon: ImageIcon },
];

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="mb-3 flex gap-2 overflow-x-auto rounded-xl border border-border/70 bg-card/60 p-2 md:hidden">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

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
