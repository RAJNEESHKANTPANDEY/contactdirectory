export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_PALETTE = [
  ['#1B2740', '#F6F4EF'],
  ['#8C6A3F', '#F6F4EF'],
  ['#2F6844', '#F6F4EF'],
  ['#324467', '#F6F4EF'],
  ['#A8402C', '#F6F4EF'],
  ['#475569', '#F6F4EF'],
  ['#B7862A', '#F6F4EF'],
];

export function avatarColors(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] as [string, string];
}

export function formatDate(value?: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function tenure(dateOfJoining?: string): string {
  if (!dateOfJoining) return '—';
  const start = new Date(dateOfJoining);
  if (isNaN(start.getTime())) return '—';
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years <= 0 && months <= 0) return 'Joined this month';
  const yStr = years > 0 ? `${years} yr${years > 1 ? 's' : ''}` : '';
  const mStr = months > 0 ? `${months} mo` : '';
  return [yStr, mStr].filter(Boolean).join(' ');
}
