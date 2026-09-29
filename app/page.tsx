'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ShieldCheck, Users2, Building2, LockKeyhole } from 'lucide-react';
import { Contact } from '@/types/contact';
import ContactCard from '@/components/ContactCard';
import ContactDetailOverlay from '@/components/ContactDetailOverlay';
import FilterBar, { EMPTY_FILTERS, FilterState } from '@/components/FilterBar';

export default function HomePage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [active, setActive] = useState<Contact | null>(null);

  useEffect(() => {
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => setContacts(data.contacts || []))
      .catch(() => setError('Could not load the directory. Please try again shortly.'))
      .finally(() => setLoading(false));
  }, []);

  const options = useMemo(() => {
    const uniq = (arr: (string | undefined)[]) =>
      Array.from(new Set(arr.filter(Boolean) as string[])).sort();
    return {
      departments: uniq(contacts.map((c) => c.department)),
      categories: uniq(contacts.map((c) => c.category)),
      cities: uniq(contacts.map((c) => c.city)),
      states: uniq(contacts.map((c) => c.state)),
    };
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return contacts
      .filter((c) => {
        if (q) {
          const haystack = [
            c.name,
            c.designation,
            c.department,
            c.employeeId,
            c.email,
            c.phone,
            c.altPhone,
            c.city,
            c.state,
            ...(c.tags || []),
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        if (filters.department !== 'all' && c.department !== filters.department) return false;
        if (filters.category !== 'all' && c.category !== filters.category) return false;
        if (filters.city !== 'all' && c.city !== filters.city) return false;
        if (filters.state !== 'all' && c.state !== filters.state) return false;
        if (filters.status !== 'all' && c.status !== filters.status) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, filters]);

  const activeCount = contacts.filter((c) => c.status === 'active').length;
  const departmentCount = new Set(contacts.map((c) => c.department).filter(Boolean)).size;

  return (
    <main className="min-h-screen">
      {/* Header / hero */}
      <header className="bg-ink-900 text-paper relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 14px)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-8 pt-12 pb-10 sm:pt-16 sm:pb-14">
          <div className="flex items-center gap-2 text-brass-300 text-xs uppercase tracking-[0.25em] font-mono mb-4">
            <ShieldCheck size={14} /> Official Register
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] max-w-3xl">
            National Informatics Center, Malkangiri 
          </h1>
          <p className="text-ink-200 mt-4 max-w-xl text-[15px] leading-relaxed">
            Look up any official, their contact details, and where they sit within the
            administrative hierarchy — all in one searchable public directory.
          </p>

          <div className="flex flex-wrap gap-6 mt-8">
            <Stat icon={<Users2 size={16} />} label="Officials listed" value={contacts.length} />
            <Stat icon={<ShieldCheck size={16} />} label="Currently active" value={activeCount} />
            <Stat icon={<Building2 size={16} />} label="Departments" value={departmentCount} />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 -mt-6 sm:-mt-7 pb-20">
        <FilterBar
          filters={filters}
          onChange={setFilters}
          options={options}
          resultCount={filtered.length}
        />

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-xl bg-white/50 border border-ink-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <p className="mt-8 text-center text-sm text-seal-red">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="mt-16 text-center">
            <p className="font-display text-xl text-ink-500">No matching officials</p>
            <p className="text-sm text-ink-400 mt-1">
              Try adjusting your search or clearing filters.
            </p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            {filtered.map((c) => (
              <ContactCard key={c.id} contact={c} onOpen={setActive} />
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-ink-100 bg-white/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-ink-400">
            © {new Date().getFullYear()} DhenkanalHQ. Directory maintained by the Administration Office.
          </p>
          <a
            href="/admin/login"
            className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-brass-700"
          >
            <LockKeyhole size={12} /> Staff &amp; admin login
          </a>
        </div>
      </footer>

      <AnimatePresence>
        {active && (
          <ContactDetailOverlay
            contact={active}
            allContacts={contacts}
            onClose={() => setActive(null)}
            onNavigate={setActive}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-brass-300">
        {icon}
      </div>
      <div>
        <p className="font-display text-xl font-semibold leading-none">{value}</p>
        <p className="text-[11px] text-ink-300 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
