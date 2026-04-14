import type { PublicDeal } from '@/features/deals/types';

function normalizeDealTypeCode(typeCode: string | null) {
  if (!typeCode) {
    return null;
  }

  switch (typeCode) {
    case 'discount':
      return 'price_drop';
    case 'free_shipping':
      return 'info';
    default:
      return typeCode;
  }
}

export function formatDealPrice(value: number | null, currencyCode: string) {
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

export function deriveOriginalPriceFromDiscount(currentPrice: number | null, discountPercent: number | null) {
  if (currentPrice === null || discountPercent === null) {
    return null;
  }

  if (currentPrice < 0 || discountPercent <= 0 || discountPercent >= 100) {
    return null;
  }

  const originalPrice = currentPrice / (1 - discountPercent / 100);
  return Number(originalPrice.toFixed(2));
}

export type DealValueModel = {
  typeCode: string | null;
  currentPrice: string | null;
  originalPrice: string | null;
  couponCode: string | null;
  bundleText: string | null;
  dealTypeLabel: string | null;
  percentageLabel: string | null;
  discountBadgeLabel: string | null;
};

export function buildDealValueModel(deal: PublicDeal): DealValueModel {
  const typeCode = normalizeDealTypeCode(deal.deal_types?.code ?? null);
  const couponCode = deal.coupon_code?.trim() || null;
  const bundleText = deal.bundle_text?.trim() || null;
  const resolvedOriginalPriceValue =
    deal.original_price ??
    (typeCode === 'price_drop' ? deriveOriginalPriceFromDiscount(deal.sale_price, deal.discount_percent) : null);
  const currentPrice = formatDealPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatDealPrice(resolvedOriginalPriceValue, deal.currency_code);
  const calculatedDiscount = calculateDiscountPercentage(resolvedOriginalPriceValue, deal.sale_price);
  const resolvedPercent = calculatedDiscount ?? deal.discount_percent;
  const discountBadgeLabel = resolvedPercent !== null ? `-${resolvedPercent}%` : null;

  return {
    typeCode,
    currentPrice,
    originalPrice,
    couponCode,
    bundleText,
    dealTypeLabel: deal.deal_types?.name ?? null,
    percentageLabel: resolvedPercent !== null ? `-${resolvedPercent}%` : null,
    discountBadgeLabel,
  };
}
