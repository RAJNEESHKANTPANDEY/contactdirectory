'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Contact } from '@/types/contact';
import Avatar from './Avatar';

export default function ContactCard({
  contact,
  onOpen,
}: {
  contact: Contact;
  onOpen: (c: Contact) => void;
}) {
  return (
    <motion.button
      layoutId={`card-${contact.id}`}
      onClick={() => onOpen(contact)}
      className="group text-left w-full bg-white/70 backdrop-blur-sm border border-ink-100 rounded-xl p-5 shadow-card hover:border-brass-400 hover:-translate-y-0.5 transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass-500"
    >
      <div className="flex items-start gap-4">
        <motion.div layoutId={`avatar-${contact.id}`}>
          <Avatar name={contact.name} photo={contact.photo} size={52} />
        </motion.div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <motion.h3
              layoutId={`name-${contact.id}`}
              className="font-display text-lg font-semibold text-ink-900 truncate"
            >
              {contact.name}
            </motion.h3>
            <span
              className={`h-2 w-2 rounded-full flex-shrink-0 ${
                contact.status === 'active' ? 'bg-seal-green' : 'bg-ink-300'
              }`}
              title={contact.status === 'active' ? 'Active' : 'Inactive'}
            />
          </div>
          <p className="text-sm text-brass-700 font-medium truncate">{contact.designation}</p>
          <p className="text-xs text-ink-400 mt-0.5 truncate">{contact.department}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-dashed border-ink-100 space-y-1.5">
        {contact.email && (
          <div className="flex items-center gap-2 text-xs text-ink-500 truncate">
            <Mail size={13} className="text-ink-300 flex-shrink-0" />
            <span className="truncate">{contact.email}</span>
          </div>
        )}
        {contact.phone && (
          <div className="flex items-center gap-2 text-xs text-ink-500 font-mono">
            <Phone size={13} className="text-ink-300 flex-shrink-0" />
            <span>{contact.phone}</span>
          </div>
        )}
        {contact.city && (
          <div className="flex items-center gap-2 text-xs text-ink-500">
            <MapPin size={13} className="text-ink-300 flex-shrink-0" />
            <span>
              {contact.city}
              {contact.state ? `, ${contact.state}` : ''}
            </span>
          </div>
        )}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {contact.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] uppercase tracking-wide bg-brass-100 text-brass-700 px-2 py-0.5 rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.button>
  );
}
