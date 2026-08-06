'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, LockKeyhole, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Incorrect password.');
        setLoading(false);
        return;
      }
      router.push(params.get('next') || '/admin');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="h-12 w-12 rounded-full bg-brass-500/20 text-brass-300 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={22} />
          </div>
          <h1 className="font-display text-2xl text-paper font-semibold">Admin Access</h1>
          <p className="text-ink-300 text-sm mt-1">
            Sign in to manage the DirectoryHQ register.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="bg-paper rounded-2xl shadow-panel p-6 sm:p-7 space-y-4"
        >
          <div>
            <label className="block text-xs uppercase tracking-wide text-ink-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <LockKeyhole
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300"
              />
              <input
                type="password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white border border-ink-100 text-sm focus-visible:outline-none focus-visible:border-brass-400 focus-visible:ring-1 focus-visible:ring-brass-300"
              />
            </div>
          </div>

          {error && <p className="text-xs text-seal-red">{error}</p>}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full flex items-center justify-center gap-2 bg-ink-900 hover:bg-ink-800 disabled:opacity-50 text-paper font-medium py-2.5 rounded-lg transition-colors"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            Sign in
          </button>

          <a
            href="/"
            className="block text-center text-xs text-ink-400 hover:text-brass-700 pt-1"
          >
            ← Back to public directory
          </a>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
