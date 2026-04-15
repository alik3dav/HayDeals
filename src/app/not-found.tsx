import Link from 'next/link';

import { PageContainer } from '@/components/layout/page-container';

export default function NotFoundPage() {
  return (
    <PageContainer className="py-12">
      <main className="mx-auto max-w-xl rounded-xl border border-border/70 bg-card/40 p-6 text-center">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The page you are looking for does not exist or may have moved.</p>
        <Link className="mt-5 inline-flex rounded-md border border-border/60 px-4 py-2 text-sm font-medium hover:bg-accent" href="/">
          Back to home
        </Link>
      </main>
    </PageContainer>
  );
}
