export function formatPrice(value: number | null, currencyCode: string) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRelativeTime(dateIso: string) {
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  const createdAt = new Date(dateIso).getTime();
  const now = Date.now();
  const diffMinutes = Math.round((createdAt - now) / (1000 * 60));

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  return formatter.format(Math.round(diffHours / 24), 'day');
}

export function compactId(profileId: string) {
  return `u_${profileId.slice(0, 8)}`;
}
