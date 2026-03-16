import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-only Supabase client — used exclusively for auth operations
 * (sign-in, sign-out, getUser). Do NOT use for data queries;
 * all data access goes through API routes.
 */
export function getAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
