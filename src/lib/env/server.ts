type ServerVar = 'SUPABASE_SERVICE_ROLE_KEY';

function readServerEnv(name: ServerVar) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: readServerEnv('SUPABASE_SERVICE_ROLE_KEY'),
} as const;
