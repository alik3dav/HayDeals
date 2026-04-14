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

export function getDiscountPercentage(priceOriginal: number | null, priceCurrent: number | null) {
  if (priceOriginal === null || priceCurrent === null) {
    return null;
  }

  if (priceOriginal <= 0 || priceCurrent < 0 || priceOriginal <= priceCurrent) {
    return null;
  }

  const percentage = ((priceOriginal - priceCurrent) / priceOriginal) * 100;
  return Math.round(percentage);
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

  const resolvedCurrentPrice = typeof deal.sale_price === 'number' && Number.isFinite(deal.sale_price) ? deal.sale_price : null;
  const resolvedOriginalPrice = typeof deal.original_price === 'number' && Number.isFinite(deal.original_price) ? deal.original_price : null;

  const hasValidPriceComparison =
    resolvedCurrentPrice !== null &&
    resolvedOriginalPrice !== null &&
    resolvedOriginalPrice > resolvedCurrentPrice;

  const effectiveOriginalPrice = hasValidPriceComparison ? resolvedOriginalPrice : null;
  const effectiveCurrentPrice = resolvedCurrentPrice;

  const currentPrice = formatDealPrice(effectiveCurrentPrice, deal.currency_code);
  const originalPrice = formatDealPrice(effectiveOriginalPrice, deal.currency_code);
  const calculatedDiscount = getDiscountPercentage(effectiveOriginalPrice, effectiveCurrentPrice);
  const shouldUseCalculatedDiscount = typeCode === 'price' || typeCode === 'price_drop' || typeCode === 'coupon';
  const resolvedPercent = shouldUseCalculatedDiscount ? calculatedDiscount ?? deal.discount_percent : deal.discount_percent;
  const showDiscountBadge = typeCode === 'price' || typeCode === 'price_drop' || typeCode === 'coupon';
  const discountBadgeLabel = showDiscountBadge && resolvedPercent !== null ? `-${resolvedPercent}%` : null;

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
