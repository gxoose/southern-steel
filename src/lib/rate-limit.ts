import { supabase } from '@/lib/supabase';

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ limited: boolean }> {
  try {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const { count, error: countError } = await supabase
      .from('rate_limit_log')
      .select('*', { count: 'exact', head: true })
      .eq('key', key)
      .gte('created_at', since);

    if (countError) {
      console.error('Rate limit check failed:', countError.message);
      return { limited: false };
    }

    if ((count ?? 0) >= maxRequests) {
      return { limited: true };
    }

    const { error: insertError } = await supabase
      .from('rate_limit_log')
      .insert({ key });

    if (insertError) {
      console.error('Rate limit log insert failed:', insertError.message);
    }

    return { limited: false };
  } catch (err) {
    console.error('Rate limit error:', err);
    return { limited: false };
  }
}
