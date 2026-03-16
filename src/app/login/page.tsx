'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthClient } from '@/lib/supabase-browser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getAuthClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const next = searchParams.get('next') || '/dashboard';
    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl">
            <span className="text-text">Southern</span>{' '}
            <span className="text-rust">Steel</span>
          </h1>
          <p className="text-sm text-text-dim font-mono mt-1">Welding & Fabrication</p>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="forge-card p-6 space-y-4">
          <h2 className="font-display text-lg text-text text-center">Sign In</h2>

          {error && (
            <div className="bg-red-hot/10 border border-red-hot/30 rounded-md px-3 py-2 text-sm text-red-hot">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-text-sec mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-rust transition-colors"
              placeholder="you@company.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-text-sec mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-surface2 border border-border rounded-md px-3 py-2.5 text-sm text-text focus:outline-none focus:border-rust transition-colors"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-rust w-full py-2.5 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs font-mono text-text-dim mt-6">
          San Antonio, TX
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-rust border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
