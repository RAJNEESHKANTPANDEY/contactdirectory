import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { createContact, readContacts } from '@/lib/db';
import { Contact } from '@/types/contact';

function matchesFilters(c: Contact, params: URLSearchParams): boolean {
  const q = params.get('q')?.trim().toLowerCase();
  const department = params.get('department');
  const category = params.get('category');
  const city = params.get('city');
  const state = params.get('state');
  const status = params.get('status');
  const tag = params.get('tag');

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
      c.officeAddress,
      c.officeLocation,
      ...(c.tags || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (department && department !== 'all' && c.department !== department) return false;
  if (category && category !== 'all' && c.category !== category) return false;
  if (city && city !== 'all' && c.city !== city) return false;
  if (state && state !== 'all' && c.state !== state) return false;
  if (status && status !== 'all' && c.status !== status) return false;
  if (tag && tag !== 'all' && !(c.tags || []).includes(tag)) return false;
  return true;
}

export async function GET(req: NextRequest) {
  const contacts = await readContacts();
  const filtered = contacts
    .filter((c) => matchesFilters(c, req.nextUrl.searchParams))
    .sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ contacts: filtered, total: filtered.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name || !body.designation) {
    return NextResponse.json(
      { error: 'name and designation are required' },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const contact: Contact = {
    id: uuid(),
    employeeId: body.employeeId || '',
    name: body.name,
    designation: body.designation,
    department: body.department || '',
    category: body.category || '',
    grade: body.grade || '',
    email: body.email || '',
    phone: body.phone || '',
    altPhone: body.altPhone || '',
    officeAddress: body.officeAddress || '',
    city: body.city || '',
    state: body.state || '',
    pincode: body.pincode || '',
    reportsTo: body.reportsTo || null,
    photo: body.photo || null,
    dateOfJoining: body.dateOfJoining || '',
    status: body.status === 'inactive' ? 'inactive' : 'active',
    bloodGroup: body.bloodGroup || '',
    emergencyContact: body.emergencyContact || '',
    officeLocation: body.officeLocation || '',
    tags: Array.isArray(body.tags) ? body.tags : [],
    notes: body.notes || '',
    createdAt: now,
    updatedAt: now,
  };

  const created = await createContact(contact);
  return NextResponse.json({ contact: created }, { status: 201 });
}
