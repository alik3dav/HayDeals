import type { Metadata } from 'next';
import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { getFeedFacets, getPublicDealsFeed } from '@/features/deals/queries';
import { absoluteUrl, buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'CipiDeals Home Feed | Community Deals, Discounts, and Offers',
  description: 'Browse the main CipiDeals deals feed with newest and hot community-verified discounts across categories.',
  pathname: '/',
});

export default async function PublicHomePage() {
  const [facets, newestDeals, hotDeals] = await Promise.all([
    getFeedFacets().catch(() => ({ categories: [] })),
    getPublicDealsFeed({ sort: 'newest', filters: {}, pageSize: 8 }).catch(() => ({ items: [] })),
    getPublicDealsFeed({ sort: 'hot', filters: {}, pageSize: 8 }).catch(() => ({ items: [] })),
  ]);

  const topCategories = facets.categories.slice(0, 8);

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': absoluteUrl('/#website'),
        name: 'CipiDeals',
        url: absoluteUrl('/'),
        description: 'Community-powered deals feed for verified discounts and offers.',
        inLanguage: 'en',
      },
      {
        '@type': 'Organization',
        '@id': absoluteUrl('/#organization'),
        name: 'CipiDeals',
        url: absoluteUrl('/'),
      },
      {
        '@type': 'CollectionPage',
        '@id': absoluteUrl('/#homepage-feed'),
        name: 'CipiDeals Home Deals Feed',
        url: absoluteUrl('/'),
        isPartOf: { '@id': absoluteUrl('/#website') },
        about: 'Community-verified deals and discounts',
        mainEntity: {
          '@type': 'ItemList',
          itemListOrder: 'https://schema.org/ItemListOrderDescending',
          numberOfItems: newestDeals.items.length,
          itemListElement: newestDeals.items.map((deal, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: absoluteUrl(`/deals/${deal.slug}`),
            name: deal.title,
          })),
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home Feed', item: absoluteUrl('/') },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: absoluteUrl('/categories') },
        ],
      },
    ],
  };

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} type="application/ld+json" />
      <PageContainer className="space-y-6">
        <section className="rounded-2xl border border-border/70 bg-card/30 p-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Find the best community-verified deals</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Explore deal streams, browse categories, and jump to the most active sections of the platform.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground" href="/deals">
              Explore filtered deals
            </Link>
            <Link className="rounded-md border border-border px-4 py-2 text-sm font-semibold" href="/categories">
              Browse categories
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-xl border border-border/70 bg-card/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Newest deals</h2>
              <Link className="text-sm text-primary hover:underline" href="/deals?sort=newest">View all</Link>
            </div>
            <ul className="space-y-2">
              {newestDeals.items?.map((deal) => (
                <li key={deal.id}>
                  <Link className="text-sm text-foreground hover:underline" href={`/deals/${deal.slug}`}>
                    {deal.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-border/70 bg-card/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Top categories</h2>
                <Link className="text-sm text-primary hover:underline" href="/categories">All categories</Link>
              </div>
              <ul className="space-y-2">
                {topCategories.map((category) => (
                  <li key={category.value}>
                    <Link className="text-sm text-foreground hover:underline" href={`/categories/${encodeURIComponent(category.value)}`}>
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-xl border border-border/70 bg-card/20 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Hot deals</h2>
                <Link className="text-sm text-primary hover:underline" href="/deals?sort=hot">View all</Link>
              </div>
              <ul className="space-y-2">
                {hotDeals.items?.map((deal) => (
                  <li key={deal.id}>
                    <Link className="text-sm text-foreground hover:underline" href={`/deals/${deal.slug}`}>
                      {deal.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </section>
      </PageContainer>
    </>
  );
}
