'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  UserPlus,
  Pencil,
  Trash2,
  Download,
  Users2,
  ShieldCheck,
  ShieldOff,
  Building2,
  Search,
} from 'lucide-react';
import { Contact } from '@/types/contact';
import Avatar from '@/components/Avatar';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdminDashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => setContacts(data.contacts || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return contacts;
    return contacts.filter((c) =>
      [c.name, c.designation, c.department, c.employeeId, c.email, c.phone]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [contacts, q]);

  const idToName = useMemo(() => new Map(contacts.map((c) => [c.id, c.name])), [contacts]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch(`/api/contacts/${deleteTarget.id}`, { method: 'DELETE' });
    setDeleting(false);
    setDeleteTarget(null);
    load();
  };

  const activeCount = contacts.filter((c) => c.status === 'active').length;
  const deptCount = new Set(contacts.map((c) => c.department).filter(Boolean)).size;

  return (
    <div className="p-5 sm:p-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900">Dashboard</h1>
          <p className="text-sm text-ink-400 mt-0.5">
            Manage officials, their contact details, and reporting lines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/api/export"
            className="flex items-center gap-1.5 text-sm font-medium border border-ink-100 hover:border-brass-400 text-ink-600 px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download size={15} /> Export CSV
          </a>
          <Link
            href="/admin/new"
            className="flex items-center gap-1.5 text-sm font-medium bg-ink-900 hover:bg-ink-800 text-paper px-3.5 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={15} /> Add official
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={<Users2 size={16} />} label="Total officials" value={contacts.length} />
        <StatCard icon={<ShieldCheck size={16} />} label="Active" value={activeCount} accent="text-seal-green" />
        <StatCard icon={<Building2 size={16} />} label="Departments" value={deptCount} />
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search officials..."
          className="w-full sm:w-80 pl-9 pr-3 py-2.5 rounded-lg bg-white border border-ink-100 text-sm focus-visible:outline-none focus-visible:border-brass-400 focus-visible:ring-1 focus-visible:ring-brass-300"
        />
      </div>

      <div className="bg-white border border-ink-100 rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400 border-b border-ink-100">
                <th className="py-3 px-4 font-medium">Official</th>
                <th className="py-3 px-4 font-medium hidden sm:table-cell">Department</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Reports to</th>
                <th className="py-3 px-4 font-medium hidden lg:table-cell">Contact</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-400 text-sm">
                    Loading officials…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-ink-400 text-sm">
                    No officials match your search.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((c) => (
                  <tr key={c.id} className="border-b border-ink-100 last:border-0 hover:bg-paper/60">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} photo={c.photo} size={34} />
                        <div className="min-w-0">
                          <p className="font-medium text-ink-800 truncate">{c.name}</p>
                          <p className="text-xs text-ink-400 truncate">{c.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-ink-600">{c.department || '—'}</td>
                    <td className="py-3 px-4 hidden md:table-cell text-ink-500">
                      {c.reportsTo ? idToName.get(c.reportsTo) || '—' : '—'}
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <p className="text-xs text-ink-500 font-mono">{c.phone || '—'}</p>
                      <p className="text-xs text-ink-400 truncate max-w-[180px]">{c.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                          c.status === 'active'
                            ? 'bg-seal-green/10 text-seal-green'
                            : 'bg-ink-100 text-ink-400'
                        }`}
                      >
                        {c.status === 'active' ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}
                        {c.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/edit/${c.id}`}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-brass-700 hover:bg-brass-100 transition-colors"
                          aria-label="Edit"
                        >
                          <Pencil size={14} />
                        </Link>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg text-ink-400 hover:text-seal-red hover:bg-seal-red/10 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="This will permanently remove this official from the directory. Anyone reporting to them will become unassigned. This cannot be undone."
        confirmLabel="Delete official"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-ink-100 rounded-xl p-4 flex items-center gap-3 shadow-card">
      <div className={`h-9 w-9 rounded-full bg-paper flex items-center justify-center ${accent || 'text-ink-500'}`}>
        {icon}
      </div>
      <div>
        <p className="font-display text-xl font-semibold text-ink-900 leading-none">{value}</p>
        <p className="text-[11px] text-ink-400 mt-1">{label}</p>
      </div>
    </div>
  );
}
