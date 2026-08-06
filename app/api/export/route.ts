import { NextRequest, NextResponse } from 'next/server';
import { readContacts } from '@/lib/db';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';

function csvEscape(value: unknown): string {
  const s = String(value ?? '');
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const contacts = await readContacts();
  const idToName = new Map(contacts.map((c) => [c.id, c.name]));

  const columns = [
    'employeeId',
    'name',
    'designation',
    'department',
    'category',
    'grade',
    'reportsTo',
    'email',
    'phone',
    'altPhone',
    'officeAddress',
    'city',
    'state',
    'pincode',
    'status',
    'dateOfJoining',
  ];

  const rows = [columns.join(',')];
  for (const c of contacts) {
    const row = columns.map((col) => {
      if (col === 'reportsTo') return csvEscape(c.reportsTo ? idToName.get(c.reportsTo) : '');
      return csvEscape((c as any)[col]);
    });
    rows.push(row.join(','));
  }

  return new NextResponse(rows.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="directory-export-${Date.now()}.csv"`,
    },
  });
}
