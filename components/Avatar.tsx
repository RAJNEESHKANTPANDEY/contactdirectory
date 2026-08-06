'use client';

import { initials, avatarColors } from '@/lib/format';

export default function Avatar({
  name,
  photo,
  size = 48,
  ring = false,
}: {
  name: string;
  photo?: string | null;
  size?: number;
  ring?: boolean;
}) {
  const [bg, fg] = avatarColors(name);

  if (photo) {
    return (
      <img
        src={`/api/images/${photo}`}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover flex-shrink-0 ${
          ring ? 'ring-2 ring-brass-400 ring-offset-2 ring-offset-paper' : ''
        }`}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg, color: fg }}
      className={`rounded-full flex items-center justify-center font-display font-semibold flex-shrink-0 select-none ${
        ring ? 'ring-2 ring-brass-400 ring-offset-2 ring-offset-paper' : ''
      }`}
    >
      <span style={{ fontSize: size * 0.36 }}>{initials(name)}</span>
    </div>
  );
}
