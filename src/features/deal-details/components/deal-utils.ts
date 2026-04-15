import { formatCurrency, formatRelativeTime } from '@/features/deals/utils/formatters';

export function formatPrice(value: number | null, currencyCode: string) {
  return formatCurrency(value, currencyCode);
}

export { formatRelativeTime };

export function compactId(profileId: string) {
  return `u_${profileId.slice(0, 8)}`;
}
