import type { Metadata } from 'next';
import Link from 'next/link';

import { signUpAction } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'Create account',
  description: 'Create a CipiDeals account to submit and save deals.',
  pathname: '/sign-up',
  noIndex: true,
});

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="container max-w-md py-10">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      <form className="mt-6 space-y-4" action={signUpAction}>
        <label className="sr-only" htmlFor="sign-up-email">Email</label>
        <input className="w-full rounded-md border bg-background px-3 py-2" id="sign-up-email" name="email" type="email" placeholder="Email" required />
        <label className="sr-only" htmlFor="sign-up-password">Password</label>
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
          id="sign-up-password"
          name="password"
          type="password"
          placeholder="Password"
          minLength={8}
          required
        />
        <Button className="w-full" type="submit">
          Sign up
        </Button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link className="underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </main>
  );
}
