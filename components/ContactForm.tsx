'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Upload, X, Save } from 'lucide-react';
import { Contact, ContactInput } from '@/types/contact';
import Avatar from './Avatar';
import { wouldCreateCycle } from '@/lib/hierarchy';

const DEPARTMENTS = [
  'Administration',
  'Finance',
  'Operations',
  'Human Resources',
  'Information Technology',
  'Legal',
];
const CATEGORIES = ['Leadership', 'Management', 'Officer', 'Staff'];

export default function ContactForm({
  mode,
  initial,
  allContacts,
}: {
  mode: 'create' | 'edit';
  initial?: Contact;
  allContacts: Contact[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Partial<ContactInput>>({
    employeeId: initial?.employeeId || '',
    name: initial?.name || '',
    designation: initial?.designation || '',
    department: initial?.department || DEPARTMENTS[0],
    category: initial?.category || CATEGORIES[0],
    grade: initial?.grade || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    altPhone: initial?.altPhone || '',
    officeAddress: initial?.officeAddress || '',
    city: initial?.city || '',
    state: initial?.state || '',
    pincode: initial?.pincode || '',
    reportsTo: initial?.reportsTo || null,
    photo: initial?.photo || null,
    dateOfJoining: initial?.dateOfJoining || '',
    status: initial?.status || 'active',
    bloodGroup: initial?.bloodGroup || '',
    emergencyContact: initial?.emergencyContact || '',
    officeLocation: initial?.officeLocation || '',
    tags: initial?.tags || [],
    notes: initial?.notes || '',
  });

  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(', '));
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const managerOptions = useMemo(() => {
    return allContacts
      .filter((c) => {
        if (!initial) return true;
        if (c.id === initial.id) return false;
        if (wouldCreateCycle(allContacts, initial.id, c.id)) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allContacts, initial]);

  const set = (patch: Partial<ContactInput>) => setForm((f) => ({ ...f, ...patch }));

  const handleFile = async (file: File) => {
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      set({ photo: data.filename });
    } catch (e: any) {
      setError(e.message || 'Could not upload photo');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.designation) {
      setError('Name and designation are required.');
      return;
    }
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const url = mode === 'create' ? '/api/contacts' : `/api/contacts/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save official');
      router.push('/admin');
      router.refresh();
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="max-w-3xl">
      {error && (
        <div className="mb-4 text-sm text-seal-red bg-seal-red/10 border border-seal-red/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {/* Photo */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar name={form.name || '?'} photo={form.photo} size={68} />
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 text-sm border border-ink-100 hover:border-brass-400 text-ink-600 px-3 py-1.5 rounded-lg transition-colors"
          >
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            {form.photo ? 'Change photo' : 'Upload photo'}
          </button>
          {form.photo && (
            <button
              type="button"
              onClick={() => set({ photo: null })}
              className="ml-2 text-xs text-ink-400 hover:text-seal-red"
            >
              Remove
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <p className="text-[11px] text-ink-400 mt-1.5">JPEG, PNG, WebP or GIF. Max 5MB.</p>
        </div>
      </div>

      <FormSection title="Identity">
        <Field label="Full name" required>
          <input
            value={form.name}
            onChange={(e) => set({ name: e.target.value })}
            className={inputClass}
            placeholder="e.g. Anjali Bhatt"
          />
        </Field>
        <Field label="Employee ID">
          <input
            value={form.employeeId}
            onChange={(e) => set({ employeeId: e.target.value })}
            className={`${inputClass} font-mono`}
            placeholder="EMP-00123"
          />
        </Field>
        <Field label="Designation" required>
          <input
            value={form.designation}
            onChange={(e) => set({ designation: e.target.value })}
            className={inputClass}
            placeholder="e.g. Deputy Director, Finance"
          />
        </Field>
        <Field label="Grade / Rank">
          <input
            value={form.grade}
            onChange={(e) => set({ grade: e.target.value })}
            className={inputClass}
            placeholder="e.g. Grade III"
          />
        </Field>
      </FormSection>

      <FormSection title="Organization">
        <Field label="Department">
          <select
            value={form.department}
            onChange={(e) => set({ department: e.target.value })}
            className={inputClass}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select
            value={form.category}
            onChange={(e) => set({ category: e.target.value })}
            className={inputClass}
          >
            {CATEGORIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reports to" hint="Determines this official's place in the hierarchy tree">
          <select
            value={form.reportsTo || ''}
            onChange={(e) => set({ reportsTo: e.target.value || null })}
            className={inputClass}
          >
            <option value="">No manager (top of hierarchy)</option>
            {managerOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} — {m.designation}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select
            value={form.status}
            onChange={(e) => set({ status: e.target.value as 'active' | 'inactive' })}
            className={inputClass}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </Field>
      </FormSection>

      <FormSection title="Contact details">
        <Field label="Email">
          <input
            type="email"
            value={form.email}
            onChange={(e) => set({ email: e.target.value })}
            className={inputClass}
            placeholder="name@example.gov.in"
          />
        </Field>
        <Field label="Phone">
          <input
            value={form.phone}
            onChange={(e) => set({ phone: e.target.value })}
            className={`${inputClass} font-mono`}
            placeholder="+91 98220 10001"
          />
        </Field>
        <Field label="Alternate phone">
          <input
            value={form.altPhone}
            onChange={(e) => set({ altPhone: e.target.value })}
            className={`${inputClass} font-mono`}
          />
        </Field>
        <Field label="Emergency contact">
          <input
            value={form.emergencyContact}
            onChange={(e) => set({ emergencyContact: e.target.value })}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </FormSection>

      <FormSection title="Address">
        <Field label="Office address" full>
          <input
            value={form.officeAddress}
            onChange={(e) => set({ officeAddress: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Office location" hint="Building / floor / room">
          <input
            value={form.officeLocation}
            onChange={(e) => set({ officeLocation: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => set({ city: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="State">
          <input
            value={form.state}
            onChange={(e) => set({ state: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Pincode">
          <input
            value={form.pincode}
            onChange={(e) => set({ pincode: e.target.value })}
            className={`${inputClass} font-mono`}
          />
        </Field>
      </FormSection>

      <FormSection title="Additional">
        <Field label="Date of joining">
          <input
            type="date"
            value={form.dateOfJoining}
            onChange={(e) => set({ dateOfJoining: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Blood group">
          <input
            value={form.bloodGroup}
            onChange={(e) => set({ bloodGroup: e.target.value })}
            className={inputClass}
            placeholder="e.g. O+"
          />
        </Field>
        <Field label="Tags" full hint="Comma-separated, e.g. Budgeting, Audit">
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Notes" full>
          <textarea
            value={form.notes}
            onChange={(e) => set({ notes: e.target.value })}
            rows={3}
            className={inputClass}
          />
        </Field>
      </FormSection>

      <div className="flex items-center gap-2 mt-8 pb-12">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 bg-ink-900 hover:bg-ink-800 disabled:opacity-60 text-paper font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {mode === 'create' ? 'Add official' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 px-4 py-2.5"
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  'w-full px-3 py-2.5 rounded-lg bg-white border border-ink-100 text-sm text-ink-800 focus-visible:outline-none focus-visible:border-brass-400 focus-visible:ring-1 focus-visible:ring-brass-300';

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-[0.15em] text-ink-400 font-semibold mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
  required,
  full,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
  hint?: string;
}) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="block text-xs font-medium text-ink-600 mb-1.5">
        {label} {required && <span className="text-seal-red">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-ink-400 mt-1">{hint}</p>}
    </div>
  );
}
