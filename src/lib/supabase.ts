import { createClient, SupabaseClient } from '@supabase/supabase-js';

// --- Service-role client (bypasses RLS, used in auth-protected API routes) ---
let _supabase: SupabaseClient | null = null;

function getServiceClient(): SupabaseClient {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Fall back to anon key if service role key isn't set yet
  const key = serviceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'your_supabase_url_here') {
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  _supabase = createClient(url, key);
  return _supabase;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient = new Proxy({} as any, {
  get(_, prop) {
    const client = getServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

// --- Anon client (subject to RLS, used in public routes) ---
let _supabaseAnon: SupabaseClient | null = null;

function getAnonClient(): SupabaseClient {
  if (_supabaseAnon) return _supabaseAnon;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === 'your_supabase_url_here') {
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }

  _supabaseAnon = createClient(url, key);
  return _supabaseAnon;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabaseAnon: SupabaseClient = new Proxy({} as any, {
  get(_, prop) {
    const client = getAnonClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (client as any)[prop];
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});
