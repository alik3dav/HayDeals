import type { PublicDeal } from '@/features/deals/types';
import { calculateDiscountPercentage, formatCurrency } from '@/features/deals/utils/formatters';

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

  const currentPrice = formatCurrency(resolvedCurrentPrice, deal.currency_code);
  const originalPrice = formatCurrency(resolvedOriginalPrice, deal.currency_code);
  const calculatedDiscount = calculateDiscountPercentage(resolvedOriginalPrice, resolvedCurrentPrice);
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
