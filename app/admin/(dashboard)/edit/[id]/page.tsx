'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Contact } from '@/types/contact';
import ContactForm from '@/components/ContactForm';

export default function EditOfficialPage() {
  const params = useParams();
  const id = params.id as string;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [current, setCurrent] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/contacts').then((r) => r.json()),
      fetch(`/api/contacts/${id}`).then((r) => r.json()),
    ])
      .then(([listData, detailData]) => {
        setContacts(listData.contacts || []);
        if (detailData.contact) {
          setCurrent(detailData.contact);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-ink-400 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading official…
      </div>
    );
  }

  if (notFound || !current) {
    return <div className="p-8 text-sm text-ink-500">Official not found.</div>;
  }

  return (
    <div className="p-5 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">
        Edit {current.name}
      </h1>
      <p className="text-sm text-ink-400 mb-6">
        Update contact details and hierarchy placement.
      </p>
      <ContactForm mode="edit" initial={current} allContacts={contacts} />
    </div>
  );
}
