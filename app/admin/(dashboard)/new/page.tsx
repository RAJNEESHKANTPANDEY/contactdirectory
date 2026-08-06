'use client';

import { useEffect, useState } from 'react';
import { Contact } from '@/types/contact';
import ContactForm from '@/components/ContactForm';

export default function NewOfficialPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetch('/api/contacts')
      .then((r) => r.json())
      .then((data) => setContacts(data.contacts || []));
  }, []);

  return (
    <div className="p-5 sm:p-8">
      <h1 className="font-display text-2xl font-semibold text-ink-900 mb-1">Add Official</h1>
      <p className="text-sm text-ink-400 mb-6">
        Add a new official to the directory and place them within the hierarchy.
      </p>
      <ContactForm mode="create" allContacts={contacts} />
    </div>
  );
}
