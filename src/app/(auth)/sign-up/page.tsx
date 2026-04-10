import Link from 'next/link';

import { signUpAction } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="container max-w-md py-10">
      <h1 className="text-2xl font-semibold">Create account</h1>
      {error ? <p className="mt-3 text-sm text-red-500">{error}</p> : null}
      <form className="mt-6 space-y-4" action={signUpAction}>
        <input className="w-full rounded-md border bg-background px-3 py-2" name="email" type="email" placeholder="Email" required />
        <input
          className="w-full rounded-md border bg-background px-3 py-2"
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
