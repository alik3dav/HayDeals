import Image from 'next/image';
import Link from 'next/link';

export type SidebarAd = {
  id: string;
  label?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  href: string;
  imageAlt?: string;
  backgroundImageUrl?: string;
  imageOnly?: boolean;
};

type SidebarAdModuleProps = {
  ad: SidebarAd;
};

export function SidebarAdModule({ ad }: SidebarAdModuleProps) {
  const showTextualContent = !ad.imageOnly;

  return (
    <section className="rounded-xl border border-border/70 bg-card/30 p-2">
      {ad.label ? <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">{ad.label}</p> : null}
      <Link aria-label={ad.title ? `Learn more about ${ad.title}` : 'Learn more'} className="group block" href={ad.href}>
        <div className="relative aspect-[5/3] overflow-hidden rounded-lg border border-border/70 bg-secondary/50">
          {ad.backgroundImageUrl ? (
            <Image alt={ad.imageAlt ?? ad.title ?? 'Sidebar advertisement'} className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" fill sizes="320px" src={ad.backgroundImageUrl} />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs text-muted-foreground">No ad image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/55 to-transparent" />

          {showTextualContent ? (
            <div className="absolute inset-x-0 bottom-0 p-3 text-foreground">
              {ad.title ? <h2 className="text-sm font-semibold leading-5 text-foreground">{ad.title}</h2> : null}
              {ad.description ? <p className="mt-1 line-clamp-3 text-xs leading-4 text-foreground/90">{ad.description}</p> : null}
              {ad.ctaLabel ? (
                <span className="mt-2 inline-flex rounded-md bg-surface-contrast px-2.5 py-1.5 text-xs font-semibold text-surface-contrast-foreground">{ad.ctaLabel}</span>
              ) : null}
            </div>
          ) : null}
        </div>
      </Link>
    </section>
  );
}
