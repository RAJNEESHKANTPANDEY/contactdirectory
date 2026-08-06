import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { Contact } from '@/types/contact';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'contacts.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureDirs() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, '[]', 'utf-8');
}

// Simple write queue to serialize writes and avoid race conditions
// between concurrent API requests hitting the same JSON file.
let writeQueue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const result = writeQueue.then(fn, fn);
  writeQueue = result.catch(() => undefined);
  return result;
}

export async function readContacts(): Promise<Contact[]> {
  ensureDirs();
  const raw = await fsp.readFile(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw) as Contact[];
  } catch {
    return [];
  }
}

async function writeContacts(contacts: Contact[]): Promise<void> {
  ensureDirs();
  const tmpFile = DB_FILE + '.tmp';
  await fsp.writeFile(tmpFile, JSON.stringify(contacts, null, 2), 'utf-8');
  await fsp.rename(tmpFile, DB_FILE);
}

export async function getContact(id: string): Promise<Contact | undefined> {
  const contacts = await readContacts();
  return contacts.find((c) => c.id === id);
}

export async function createContact(contact: Contact): Promise<Contact> {
  return enqueue(async () => {
    const contacts = await readContacts();
    contacts.push(contact);
    await writeContacts(contacts);
    return contact;
  });
}

export async function updateContact(
  id: string,
  patch: Partial<Contact>
): Promise<Contact | undefined> {
  return enqueue(async () => {
    const contacts = await readContacts();
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) return undefined;
    contacts[idx] = { ...contacts[idx], ...patch, id, updatedAt: new Date().toISOString() };
    await writeContacts(contacts);
    return contacts[idx];
  });
}

export async function deleteContact(id: string): Promise<boolean> {
  return enqueue(async () => {
    const contacts = await readContacts();
    const idx = contacts.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    // Detach any subordinates from the deleted manager
    const cleaned = contacts.map((c) =>
      c.reportsTo === id ? { ...c, reportsTo: null } : c
    );
    cleaned.splice(idx, 1);
    await writeContacts(cleaned);
    return true;
  });
}

export function getUploadsDir() {
  ensureDirs();
  return UPLOADS_DIR;
}

// Build the chain of superiors, from the contact's direct manager up to the top.
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
  return contacts.filter((c) => c.reportsTo === id);
}

export function getPeers(contacts: Contact[], contact: Contact): Contact[] {
  if (!contact.reportsTo) return [];
  return contacts.filter(
    (c) => c.reportsTo === contact.reportsTo && c.id !== contact.id
  );
}
