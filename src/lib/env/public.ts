type PublicVar = 'NEXT_PUBLIC_SUPABASE_URL' | 'NEXT_PUBLIC_SUPABASE_ANON_KEY';

function readPublicEnv(name: PublicVar) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const publicEnv = {
  NEXT_PUBLIC_SUPABASE_URL: readPublicEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: readPublicEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
} as const;
