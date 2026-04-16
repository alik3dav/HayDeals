import type { Metadata } from 'next';
import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';
import { getFeedFacets } from '@/features/deals/queries';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Deal Categories',
  description: 'Browse every active deal category and jump directly into category-specific deals.',
  pathname: '/categories',
});

export default async function CategoriesPage() {
  const facets = await getFeedFacets().catch(() => ({ categories: [] }));

  return (
    <PageContainer className="space-y-6">
      <header className="rounded-xl border border-border/70 bg-card/30 p-5">
        <h1 className="text-2xl font-semibold text-foreground">Deal categories</h1>
        <p className="mt-2 text-sm text-muted-foreground">Use categories to find the exact deal stream you want to follow.</p>
      </header>

      {facets.categories.length > 0 ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {facets.categories.map((category) => (
            <Link
              className="rounded-xl border border-border/70 bg-card/20 p-4 transition-colors hover:bg-card/40"
              href={`/categories/${encodeURIComponent(category.value)}`}
              key={category.value}
            >
              <h2 className="text-base font-semibold text-foreground">{category.label}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Browse latest, hot, and discussed deals in this category.</p>
            </Link>
          ))}
        </section>
      ) : (
        <p className="rounded-md border border-border/70 bg-card/20 p-4 text-sm text-muted-foreground">No categories are available yet.</p>
      )}
    </PageContainer>
  );
}
