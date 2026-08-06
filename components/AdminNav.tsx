'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, UserPlus, Globe2, LogOut, ShieldCheck } from 'lucide-react';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const items = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/new', label: 'Add Official', icon: UserPlus, exact: false },
  ];

  return (
    <nav className="sm:w-60 flex-shrink-0 bg-ink-900 text-paper sm:min-h-screen flex sm:flex-col justify-between">
      <div className="p-5">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-full bg-brass-500/20 text-brass-300 flex items-center justify-center">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="font-display font-semibold leading-none">DirectoryHQ</p>
            <p className="text-[10px] text-ink-300 uppercase tracking-wide mt-0.5">
              Admin Console
            </p>
          </div>
        </div>

        <div className="space-y-1">
          {items.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-paper font-medium'
                    : 'text-ink-300 hover:bg-white/5 hover:text-paper'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-paper transition-colors"
          >
            <Globe2 size={16} />
            View public site
          </Link>
        </div>
      </div>

      <div className="p-5">
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-300 hover:bg-white/5 hover:text-seal-red w-full transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
