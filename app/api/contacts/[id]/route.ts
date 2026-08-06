import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import {
  deleteContact,
  getContact,
  getDirectReports,
  getPeers,
  getSuperiorChain,
  getUploadsDir,
  readContacts,
  updateContact,
} from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const contacts = await readContacts();
  const contact = contacts.find((c) => c.id === params.id);
  if (!contact) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const superiors = getSuperiorChain(contacts, contact);
  const directReports = getDirectReports(contacts, contact.id).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const peers = getPeers(contacts, contact).sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ contact, superiors, directReports, peers });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  if (body.reportsTo === params.id) {
    return NextResponse.json(
      { error: 'A contact cannot report to itself' },
      { status: 400 }
    );
  }

  const existing = await getContact(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await updateContact(params.id, {
    employeeId: body.employeeId ?? existing.employeeId,
    name: body.name ?? existing.name,
    designation: body.designation ?? existing.designation,
    department: body.department ?? existing.department,
    category: body.category ?? existing.category,
    grade: body.grade ?? existing.grade,
    email: body.email ?? existing.email,
    phone: body.phone ?? existing.phone,
    altPhone: body.altPhone ?? existing.altPhone,
    officeAddress: body.officeAddress ?? existing.officeAddress,
    city: body.city ?? existing.city,
    state: body.state ?? existing.state,
    pincode: body.pincode ?? existing.pincode,
    reportsTo: body.reportsTo === undefined ? existing.reportsTo : body.reportsTo,
    photo: body.photo === undefined ? existing.photo : body.photo,
    dateOfJoining: body.dateOfJoining ?? existing.dateOfJoining,
    status: body.status ?? existing.status,
    bloodGroup: body.bloodGroup ?? existing.bloodGroup,
    emergencyContact: body.emergencyContact ?? existing.emergencyContact,
    officeLocation: body.officeLocation ?? existing.officeLocation,
    tags: Array.isArray(body.tags) ? body.tags : existing.tags,
    notes: body.notes ?? existing.notes,
  });

  return NextResponse.json({ contact: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const existing = await getContact(params.id);
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const ok = await deleteContact(params.id);

  if (existing.photo) {
    const filePath = path.join(getUploadsDir(), existing.photo);
    fs.unlink(filePath).catch(() => undefined);
  }

  return NextResponse.json({ ok });
}
