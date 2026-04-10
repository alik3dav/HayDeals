import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/sign-in');
  }

  return user;
}

export async function requireRole(roles: Array<'moderator' | 'admin'>) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (!profile || !roles.includes(profile.role as 'moderator' | 'admin')) {
    redirect('/dashboard');
  }

  return { user, role: profile.role as 'moderator' | 'admin' };
}
