import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { getUploadsDir } from '@/lib/db';

const MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { filename: string } }
) {
  const filename = path.basename(params.filename); // prevent path traversal
  const filePath = path.join(getUploadsDir(), filename);

  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(data, {
      headers: {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
}
