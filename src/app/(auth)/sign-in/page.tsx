import type { Metadata } from 'next';
import Link from 'next/link';

import { signInAction } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sign in',
  description: 'Sign in to your CipiDeals account.',
  pathname: '/sign-in',
  noIndex: true,
});

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <main className="container max-w-md py-10">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      {message ? <p className="mt-3 text-sm text-green-500">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      <form className="mt-6 space-y-4" action={signInAction}>
        <label className="sr-only" htmlFor="sign-in-email">Email</label>
        <input className="w-full rounded-md border bg-background px-3 py-2" id="sign-in-email" name="email" type="email" placeholder="Email" required />
        <label className="sr-only" htmlFor="sign-in-password">Password</label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          id="sign-in-password"
          name="password"
          type="password"
          placeholder="Password"
          required
        />
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Need an account?{' '}
        <Link className="underline" href="/sign-up">
          Sign up
        </Link>
      </p>
    </main>
  );
}
