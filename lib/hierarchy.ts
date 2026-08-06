import { Contact } from '@/types/contact';

export function getSuperiorChain(contacts: Contact[], contact: Contact): Contact[] {
  const chain: Contact[] = [];
  let current = contact;
  const visited = new Set<string>([contact.id]);
  while (current.reportsTo) {
    const manager = contacts.find((c) => c.id === current.reportsTo);
    if (!manager || visited.has(manager.id)) break;
    chain.unshift(manager);
    visited.add(manager.id);
    current = manager;
  }
  return chain;
}

export function getDirectReports(contacts: Contact[], id: string): Contact[] {
  return contacts
    .filter((c) => c.reportsTo === id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getPeers(contacts: Contact[], contact: Contact): Contact[] {
  if (!contact.reportsTo) return [];
  return contacts
    .filter((c) => c.reportsTo === contact.reportsTo && c.id !== contact.id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// Returns true if `candidateManagerId` is a descendant of `contactId`, which
// would create a cycle if assigned as its manager.
export function wouldCreateCycle(
  contacts: Contact[],
  contactId: string,
  candidateManagerId: string
): boolean {
  let current: string | null = candidateManagerId;
  const visited = new Set<string>();
  while (current) {
    if (current === contactId) return true;
    if (visited.has(current)) return false;
    visited.add(current);
    const c = contacts.find((x) => x.id === current);
    current = c?.reportsTo ?? null;
  }
  return false;
}
