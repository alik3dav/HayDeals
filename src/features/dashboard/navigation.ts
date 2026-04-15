import { Bookmark, Clock3, Home, PlusSquare, ReceiptText, Settings } from 'lucide-react';

export const DASHBOARD_NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: Home },
  { href: '/dashboard/submit-deal', label: 'Submit deal', icon: PlusSquare },
  { href: '/dashboard/my-deals', label: 'My deals', icon: ReceiptText },
  { href: '/dashboard/saved', label: 'Saved deals', icon: Bookmark },
  { href: '/dashboard/activity', label: 'Activity', icon: Clock3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
] as const;
