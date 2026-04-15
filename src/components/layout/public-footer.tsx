import Link from 'next/link';

import { getFeedFacets } from '@/features/deals/queries';
import { createClient } from '@/lib/supabase/server';

const DISCOVER_LINKS = [
  { href: '/?sort=newest', label: 'Newest deals' },
  { href: '/?sort=hot', label: 'Hot deals' },
  { href: '/?sort=discussed', label: 'Most discussed' },
] as const;

const ACCOUNT_LINKS = [
  { href: '/sign-in', label: 'Sign in' },
  { href: '/sign-up', label: 'Create account' },
  { href: '/dashboard/submit-deal', label: 'Submit a deal' },
] as const;

const DASHBOARD_LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/saved', label: 'Saved deals' },
  { href: '/dashboard/my-deals', label: 'My deals' },
  { href: '/dashboard/activity', label: 'Activity' },
] as const;

export async function PublicFooter() {
  const supabase = await createClient();
  let categories: { value: string; label: string }[] = [];
  let branding: { logotypeUrl: string | null; logoAlt: string | null; logoSize: 'small' | 'medium' | 'large' | 'custom' } = {
    logotypeUrl: null,
    logoAlt: null,
    logoSize: 'medium',
  };

  try {
    const facets = await getFeedFacets();
    categories = facets.categories.slice(0, 6);
  } catch (error) {
    console.error('Failed to load categories for footer.', error);
  }

  try {
    const { data } = await supabase
      .from('website_control_settings')
      .select('logotype_url, logo_alt, logo_size')
      .eq('id', 1)
      .maybeSingle();

    if (data) {
      branding = {
        logotypeUrl: data.logotype_url,
        logoAlt: data.logo_alt,
        logoSize: data.logo_size ?? 'medium',
      };
    }
  } catch (error) {
    console.error('Failed to load website branding for footer.', error);
  }

  const year = new Date().getFullYear();
  const logoClassName =
    branding.logoSize === 'small'
      ? 'h-6 w-auto max-w-[120px]'
      : branding.logoSize === 'large'
        ? 'h-10 w-auto max-w-[240px]'
        : branding.logoSize === 'custom'
          ? 'h-10 w-auto max-w-[320px]'
          : 'h-8 w-auto max-w-[180px]';

  return (
    <footer className="mt-10 border-t border-border/60 bg-background/80" role="contentinfo">
      <div className="container py-8 md:py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[minmax(0,1.15fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
          <section aria-label="Brand" className="space-y-3">
            <Link className="inline-flex items-center text-sm font-semibold tracking-tight" href="/">
              {branding.logotypeUrl ? (
                <img
                  alt={branding.logoAlt || 'CipiDeals'}
                  className={logoClassName}
                  src={branding.logotypeUrl}
                />
              ) : (
                'CipiDeals'
              )}
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground">
              Discover and share the best verified deals from the community.
            </p>
          </section>

          <nav aria-label="Discover" className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Discover</h2>
            <ul className="space-y-1.5 text-sm">
              {DISCOVER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className="text-foreground/90 transition-colors hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Top categories" className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Top categories</h2>
            {categories.length > 0 ? (
              <ul className="space-y-1.5 text-sm">
                {categories.map((category) => (
                  <li key={category.value}>
                    <Link
                      className="text-foreground/90 transition-colors hover:text-foreground"
                      href={`/?category=${encodeURIComponent(category.value)}`}
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Browse by category from the homepage filters.</p>
            )}
          </nav>

          <nav aria-label="Account" className="space-y-2.5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</h2>
            <ul className="space-y-1.5 text-sm">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link className="text-foreground/90 transition-colors hover:text-foreground" href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-border/50 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} CipiDeals. All rights reserved.</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {DASHBOARD_LINKS.map((link) => (
              <li key={link.href}>
                <Link className="transition-colors hover:text-foreground" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
