export function formatCurrency(value: number | null, currencyCode: string) {
  if (value === null) {
    return null;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateDiscountPercentage(originalPrice: number | null, currentPrice: number | null) {
  if (originalPrice === null || currentPrice === null) {
    return null;
  }

  if (originalPrice <= 0 || currentPrice < 0 || originalPrice <= currentPrice) {
    return null;
  }

  const percentage = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(percentage);
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

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
}

export function formatExpiryLabel(expiresAt: string | null) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtMs = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtMs)) {
    return null;
  }

  const diffDays = Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Expired';
  }

  if (diffDays === 1) {
    return 'Expires in 1 day';
  }

  return `Expires in ${diffDays} days`;
}

export function getExpiryBadgeClassName(expiresAt: string | null) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtMs = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtMs)) {
    return null;
  }

  const diffDays = Math.ceil((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    return 'border-border bg-secondary text-muted-foreground';
  }

  return 'border-red-500/20 bg-red-500/10 text-red-300';
}
