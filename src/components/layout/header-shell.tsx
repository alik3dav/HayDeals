import Link from 'next/link';

import { signOutAction } from '@/app/(auth)/actions';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';

export async function HeaderShell() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link className="text-sm font-semibold tracking-tight" href="/">
          HayDeals
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <form action={signOutAction}>
                <Button size="sm" type="submit" variant="outline">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
