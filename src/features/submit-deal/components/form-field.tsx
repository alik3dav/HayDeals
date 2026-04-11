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
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </label>
  );
}

export const inputStyles =
  'w-full rounded-lg border border-border/70 bg-secondary/50 px-3 py-2 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus-visible:ring-2';

export function SectionCard({ title, description, children, className }: { title: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('space-y-4 rounded-xl border border-border/70 bg-card/70 p-4', className)}>
      <header className="space-y-1">
        <h2 className="text-sm font-semibold">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
