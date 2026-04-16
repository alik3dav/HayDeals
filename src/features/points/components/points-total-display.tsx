import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

type PointsTotalDisplayProps = {
  points: number;
  label?: string;
  context?: string;
  variant?: 'highlight' | 'tile';
  className?: string;
};

const pointsFormatter = new Intl.NumberFormat('en-US');

export function PointsTotalDisplay({ points, label = 'Total points', context, variant = 'tile', className }: PointsTotalDisplayProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border/60 bg-background/40 p-3',
        variant === 'highlight' && 'rounded-xl border-border/70 bg-card/70 p-4',
        className,
      )}
    >
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground/90">
        <Sparkles className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className={cn('mt-2 text-2xl font-semibold tracking-tight text-foreground', variant === 'highlight' && 'text-3xl')}>
        {pointsFormatter.format(points)}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{context ?? (variant === 'highlight' ? 'Earned from your approved contributions and activity.' : 'Public reputation points')}</p>
    </div>
  );
}
