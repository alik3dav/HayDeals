import type { PublicDeal } from '@/features/deals/types';

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
  const typeCode = deal.deal_types?.code ?? null;
  const couponCode = deal.coupon_code?.trim() || null;
  const bundleText = deal.bundle_text?.trim() || null;
  const currentPrice = formatDealPrice(deal.sale_price, deal.currency_code);
  const originalPrice = formatDealPrice(deal.original_price, deal.currency_code);
  const calculatedDiscount = calculateDiscountPercentage(deal.original_price, deal.sale_price);
  const resolvedPercent = calculatedDiscount ?? deal.discount_percent;

  return {
    typeCode,
    currentPrice,
    originalPrice,
    couponCode,
    bundleText,
    dealTypeLabel: deal.deal_types?.name ?? null,
    percentageLabel: resolvedPercent !== null ? `-${resolvedPercent}%` : null,
    discountBadgeLabel: calculatedDiscount !== null ? `-${calculatedDiscount}%` : null,
  };
}
