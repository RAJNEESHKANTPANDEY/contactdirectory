import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { getUploadsDir } from '@/lib/db';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const formData = await req.formData().catch(() => null);
  const file = formData?.get('file');

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Use JPEG, PNG, WebP or GIF.' },
      { status: 400 }
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 5MB).' }, { status: 400 });
  }

  const ext = path.extname(file.name) || `.${file.type.split('/')[1]}`;
  const filename = `${uuid()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(getUploadsDir(), filename), buffer);

  return NextResponse.json({ filename });
}
