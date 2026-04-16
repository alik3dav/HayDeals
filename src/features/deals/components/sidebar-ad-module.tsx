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
    <section className="rounded-xl border border-border/70 bg-card/30 p-4">
      {ad.label ? (
        <span className="inline-flex rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {ad.label}
        </span>
      ) : null}

      <div className="mt-2.5 space-y-3">
        {ad.backgroundImageUrl ? (
          <Link aria-label={ad.title ? `Learn more about ${ad.title}` : 'Learn more'} className="block" href={ad.href}>
            <div className="relative h-36 overflow-hidden rounded-md border border-border/70 bg-secondary/50">
              <Image alt={ad.imageAlt ?? ad.title ?? 'Sidebar advertisement'} className="object-cover" fill sizes="320px" src={ad.backgroundImageUrl} />
            </div>
          </Link>
        ) : null}

        {showTextualContent ? (
          <>
            {ad.title || ad.description ? (
              <Link className="group block space-y-1.5" href={ad.href}>
                {ad.title ? <h2 className="text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">{ad.title}</h2> : null}
                {ad.description ? <p className="text-xs leading-5 text-muted-foreground">{ad.description}</p> : null}
              </Link>
            ) : null}

            {ad.ctaLabel ? (
              <div className="flex items-center gap-3">
                <Link
                  className="inline-flex rounded-md border border-border/80 bg-secondary/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
                  href={ad.href}
                >
                  {ad.ctaLabel}
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
