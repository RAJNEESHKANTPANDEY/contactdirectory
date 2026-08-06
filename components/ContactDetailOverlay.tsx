'use client';

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Mail,
  Phone,
  MapPin,
  Building2,
  Droplet,
  CalendarDays,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  Users,
} from 'lucide-react';
import { Contact } from '@/types/contact';
import Avatar from './Avatar';
import { formatDate, tenure } from '@/lib/format';
import { getDirectReports, getPeers, getSuperiorChain } from '@/lib/hierarchy';

export default function ContactDetailOverlay({
  contact,
  allContacts,
  onClose,
  onNavigate,
}: {
  contact: Contact;
  allContacts: Contact[];
  onClose: () => void;
  onNavigate: (c: Contact) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const superiors = useMemo(
    () => getSuperiorChain(allContacts, contact),
    [allContacts, contact]
  );
  const directReports = useMemo(
    () => getDirectReports(allContacts, contact.id),
    [allContacts, contact.id]
  );
  const peers = useMemo(() => getPeers(allContacts, contact), [allContacts, contact]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-ink-900/50 backdrop-blur-sm"
      />

      <motion.div
        layoutId={`card-${contact.id}`}
        className="relative w-full max-w-3xl bg-paper rounded-2xl shadow-panel border border-ink-100 my-4 sm:my-8 overflow-hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-white/80 hover:bg-white border border-ink-100 flex items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="bg-ink-900 text-paper px-6 sm:px-8 pt-8 pb-6 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 12px)',
            }}
          />
          <div className="relative flex items-start gap-5">
            <motion.div layoutId={`avatar-${contact.id}`}>
              <Avatar name={contact.name} photo={contact.photo} size={76} ring />
            </motion.div>
            <div className="min-w-0 pt-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-brass-300 font-mono mb-1">
                {contact.employeeId || 'Unassigned ID'}
              </p>
              <motion.h2
                layoutId={`name-${contact.id}`}
                className="font-display text-2xl sm:text-3xl font-semibold leading-tight"
              >
                {contact.name}
              </motion.h2>
              <p className="text-brass-300 font-medium mt-1">{contact.designation}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 px-2.5 py-1 rounded-full">
                  <Building2 size={12} /> {contact.department}
                </span>
                {contact.grade && (
                  <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">
                    {contact.grade}
                  </span>
                )}
                <span
                  className={`text-xs px-2.5 py-1 rounded-full ${
                    contact.status === 'active'
                      ? 'bg-seal-green/20 text-seal-green'
                      : 'bg-ink-300/20 text-ink-200'
                  }`}
                >
                  {contact.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-6 space-y-8">
          {/* Contact info grid */}
          <section>
            <h4 className="text-xs uppercase tracking-[0.15em] text-ink-400 font-semibold mb-3">
              Contact Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <InfoRow icon={<Mail size={15} />} label="Email" value={contact.email} link={contact.email ? `mailto:${contact.email}` : undefined} />
              <InfoRow icon={<Phone size={15} />} label="Phone" value={contact.phone} mono link={contact.phone ? `tel:${contact.phone}` : undefined} />
              {contact.altPhone && (
                <InfoRow icon={<Phone size={15} />} label="Alternate Phone" value={contact.altPhone} mono />
              )}
              <InfoRow
                icon={<MapPin size={15} />}
                label="Office Address"
                value={[contact.officeAddress, contact.officeLocation].filter(Boolean).join(' · ')}
              />
              <InfoRow
                icon={<MapPin size={15} />}
                label="City / State"
                value={[contact.city, contact.state, contact.pincode].filter(Boolean).join(', ')}
              />
              <InfoRow icon={<CalendarDays size={15} />} label="Date of Joining" value={formatDate(contact.dateOfJoining)} sub={tenure(contact.dateOfJoining)} />
              {contact.bloodGroup && (
                <InfoRow icon={<Droplet size={15} />} label="Blood Group" value={contact.bloodGroup} />
              )}
              {contact.emergencyContact && (
                <InfoRow icon={<ShieldAlert size={15} />} label="Emergency Contact" value={contact.emergencyContact} mono />
              )}
            </div>
            {contact.tags && contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {contact.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[10px] uppercase tracking-wide bg-brass-100 text-brass-700 px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
            {contact.notes && (
              <p className="mt-4 text-sm text-ink-500 leading-relaxed bg-white/60 border border-ink-100 rounded-lg p-3">
                {contact.notes}
              </p>
            )}
          </section>

          {/* Administrative hierarchy */}
          <section>
            <h4 className="text-xs uppercase tracking-[0.15em] text-ink-400 font-semibold mb-4 flex items-center gap-1.5">
              <Users size={13} /> Administrative Hierarchy
            </h4>

            <div className="space-y-1">
              {superiors.length === 0 && (
                <p className="text-xs text-ink-400 italic mb-2">Top of the reporting chain</p>
              )}
              {superiors.map((s, idx) => (
                <div key={s.id}>
                  <HierarchyNode contact={s} muted onClick={() => onNavigate(s)} />
                  <ChainConnector />
                </div>
              ))}

              <HierarchyNode contact={contact} current />

              {(directReports.length > 0 || peers.length > 0) && <ChainConnector />}
            </div>

            {peers.length > 0 && (
              <div className="mt-1 mb-3">
                <p className="text-[11px] text-ink-400 mb-2 pl-1">
                  Peers reporting to the same superior
                </p>
                <div className="flex flex-wrap gap-2">
                  {peers.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => onNavigate(p)}
                      className="flex items-center gap-2 bg-white border border-ink-100 hover:border-brass-400 rounded-full pl-1 pr-3 py-1 text-xs text-ink-600 transition-colors"
                    >
                      <Avatar name={p.name} photo={p.photo} size={20} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {directReports.length > 0 ? (
              <div>
                <p className="text-[11px] text-ink-400 mb-2 pl-1 flex items-center gap-1">
                  <ChevronDown size={12} /> Direct reports ({directReports.length})
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {directReports.map((r) => (
                    <HierarchyNode key={r.id} contact={r} compact onClick={() => onNavigate(r)} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-ink-400 italic pl-1">No direct reports on file</p>
            )}
          </section>
        </div>
      </motion.div>
    </div>
  );
}

function ChainConnector() {
  return (
    <div className="flex justify-start pl-[27px]">
      <div className="w-px h-4 bg-ink-200 flex items-center justify-center">
        <ChevronDown size={11} className="text-ink-300 -ml-[7px] bg-paper" />
      </div>
    </div>
  );
}

function HierarchyNode({
  contact,
  onClick,
  current,
  muted,
  compact,
}: {
  contact: Contact;
  onClick?: () => void;
  current?: boolean;
  muted?: boolean;
  compact?: boolean;
}) {
  const Comp: any = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
        current
          ? 'bg-ink-900 border-ink-900 text-paper'
          : muted
          ? 'bg-white/50 border-ink-100 hover:border-brass-400 text-ink-600'
          : 'bg-white border-ink-100 hover:border-brass-400 text-ink-700'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <Avatar name={contact.name} photo={contact.photo} size={compact ? 28 : 34} />
      <div className="min-w-0">
        <p className={`text-sm font-medium truncate ${current ? 'text-paper' : ''}`}>
          {contact.name}
          {current && <span className="ml-2 text-[10px] uppercase tracking-wide text-brass-300">Viewing</span>}
        </p>
        <p className={`text-xs truncate ${current ? 'text-brass-300' : 'text-ink-400'}`}>
          {contact.designation}
        </p>
      </div>
      {!current && <ChevronUp className="ml-auto rotate-90 text-ink-300 flex-shrink-0" size={14} />}
    </Comp>
  );
}

function InfoRow({
  icon,
  label,
  value,
  link,
  mono,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  link?: string;
  mono?: boolean;
  sub?: string;
}) {
  if (!value) return null;
  const content = (
    <span className={mono ? 'font-mono' : ''}>{value}</span>
  );
  return (
    <div className="flex gap-2.5">
      <span className="text-brass-600 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-ink-400">{label}</p>
        {link ? (
          <a href={link} className="text-sm text-ink-800 hover:text-brass-700 break-words">
            {content}
          </a>
        ) : (
          <p className="text-sm text-ink-800 break-words">{content}</p>
        )}
        {sub && <p className="text-[11px] text-ink-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}
