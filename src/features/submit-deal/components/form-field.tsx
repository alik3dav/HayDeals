import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

type FormFieldProps = {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, htmlFor, hint, error, children }: FormFieldProps) {
  return (
    <label className="block space-y-2" htmlFor={htmlFor}>
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}

export const inputStyles =
  'w-full rounded-lg border border-border/70 bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground/80 transition-colors focus:border-primary/50 focus-visible:ring-2';

export function SectionCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-4 rounded-2xl border border-border/70 bg-card/60 p-4 md:p-5', className)}>
      <header className="space-y-1">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        {description ? <p className="text-xs leading-relaxed text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
