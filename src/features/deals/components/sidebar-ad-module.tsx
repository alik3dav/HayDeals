import Image from 'next/image';
import Link from 'next/link';

export type SidebarAd = {
  id: string;
  label: string;
  title: string;
  description: string;
  ctaLabel: string;
  href: string;
  image?: {
    src: string;
    alt: string;
  };
};

type SidebarAdModuleProps = {
  ad: SidebarAd;
};

export function SidebarAdModule({ ad }: SidebarAdModuleProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-card/30 p-4">
      <span className="inline-flex rounded-full border border-border/70 bg-background/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
        {ad.label}
      </span>

      <div className="mt-2.5 space-y-3">
        <Link className="group block space-y-1.5" href={ad.href}>
          <h2 className="text-sm font-semibold leading-5 text-foreground transition-colors group-hover:text-primary">{ad.title}</h2>
          <p className="text-xs leading-5 text-muted-foreground">{ad.description}</p>
        </Link>

        <div className="flex items-center gap-3">
          {ad.image ? (
            <Link
              aria-label={`Learn more about ${ad.title}`}
              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-border/70 bg-secondary/50"
              href={ad.href}
            >
              <Image alt={ad.image.alt} className="object-cover" fill sizes="40px" src={ad.image.src} />
            </Link>
          ) : null}

          <Link
            className="inline-flex rounded-md border border-border/80 bg-secondary/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary/70"
            href={ad.href}
          >
            {ad.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
