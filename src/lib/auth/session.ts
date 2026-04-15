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
  const role = await getCurrentUserRole(user.id);

  if ((role !== 'moderator' && role !== 'admin') || !roles.includes(role)) {
    redirect('/dashboard');
  }

  return { user, role };
}

export async function getCurrentUserRole(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();

  return (profile?.role ?? null) as 'user' | 'moderator' | 'admin' | null;
}
