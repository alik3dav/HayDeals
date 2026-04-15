import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function formatRelativeDate(input: string) {
  const now = Date.now();
  const target = new Date(input).getTime();
  const diffMs = target - now;
  const absMs = Math.abs(diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (absMs < hour) {
    const minutes = Math.max(1, Math.round(absMs / minute));
    return `${minutes}m ${diffMs <= 0 ? 'ago' : 'from now'}`;
  }

  if (absMs < day) {
    const hours = Math.max(1, Math.round(absMs / hour));
    return `${hours}h ${diffMs <= 0 ? 'ago' : 'from now'}`;
  }

  const days = Math.max(1, Math.round(absMs / day));
  return `${days}d ${diffMs <= 0 ? 'ago' : 'from now'}`;
}

export function DashboardPageHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="space-y-1 rounded-xl border border-border/70 bg-card/60 px-4 py-3">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </header>
  );
}

export function DashboardStatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/70 bg-card/70">
      <CardHeader className="space-y-2 pb-2">
        <CardDescription className="text-[11px] uppercase tracking-[0.12em]">{label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{value}</CardTitle>
      </CardHeader>
      {hint ? (
        <CardContent>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </CardContent>
      ) : null}
    </Card>
  );
}

export function DealStatusBadge({ status }: { status: 'pending' | 'approved' | 'rejected' }) {
  return (
    <Badge
      className={cn(
        'rounded-md px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]',
        status === 'approved' && 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20',
        status === 'pending' && 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/20',
        status === 'rejected' && 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/20',
      )}
      variant="secondary"
    >
      {status}
    </Badge>
  );
}

export function EmptyState({ title, description, ctaLabel, ctaHref }: { title: string; description: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <Card className="border-dashed border-border/70 bg-card/40">
      <CardContent className="space-y-3 p-5 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
        {ctaLabel && ctaHref ? (
          <Link className="inline-flex rounded-md border border-border/70 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground" href={ctaHref}>
            {ctaLabel}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
