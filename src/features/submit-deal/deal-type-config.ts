export const DEAL_TYPE_CODES = ['price', 'price_drop', 'percentage', 'coupon', 'bundle', 'cashback', 'free', 'info'] as const;

export type DealTypeCode = (typeof DEAL_TYPE_CODES)[number];

export type DealFieldKey = 'salePrice' | 'originalPrice' | 'discountPercent' | 'couponCode' | 'bundleText';

type DealTypeFieldConfig = {
  label: string;
  hint: string;
  requiredFields: DealFieldKey[];
  optionalFields: DealFieldKey[];
  cardDisplay: {
    primary: 'price' | 'price_drop' | 'percentage' | 'coupon' | 'bundle' | 'cashback' | 'free' | 'info';
    badge?: string;
  };
};

export const DEAL_FIELD_META: Record<DealFieldKey, { label: string; inputMode?: 'decimal' | 'text'; placeholder?: string }> = {
  salePrice: { label: 'Current price', inputMode: 'decimal', placeholder: '49.99' },
  originalPrice: { label: 'Original price', inputMode: 'decimal', placeholder: '79.99' },
  discountPercent: { label: 'Discount percent', inputMode: 'decimal', placeholder: '20' },
  couponCode: { label: 'Coupon code', inputMode: 'text', placeholder: 'SAVE20' },
  bundleText: { label: 'Bundle offer text', inputMode: 'text', placeholder: '1+1 free, 2+1, buy 2 get 1...' },
};

export const DEAL_TYPE_CONFIG: Record<DealTypeCode, DealTypeFieldConfig> = {
  price: {
    label: 'Price',
    hint: 'Single known price with no comparison required.',
    requiredFields: ['salePrice'],
    optionalFields: [],
    cardDisplay: { primary: 'price' },
  },
  price_drop: {
    label: 'Price Drop',
    hint: 'Show old vs new price.',
    requiredFields: ['salePrice', 'originalPrice'],
    optionalFields: [],
    cardDisplay: { primary: 'price_drop', badge: 'Price drop' },
  },
  percentage: {
    label: 'Percentage',
    hint: 'Use when the offer is expressed as percentage only.',
    requiredFields: ['discountPercent'],
    optionalFields: [],
    cardDisplay: { primary: 'percentage', badge: 'Percent off' },
  },
  coupon: {
    label: 'Coupon',
    hint: 'Promo code based offer. Price fields are optional context.',
    requiredFields: ['couponCode'],
    optionalFields: ['salePrice', 'originalPrice', 'discountPercent'],
    cardDisplay: { primary: 'coupon', badge: 'Coupon' },
  },
  bundle: {
    label: 'Bundle',
    hint: 'Bundle/quantity based offer like 1+1 or 2+1.',
    requiredFields: ['bundleText'],
    optionalFields: ['salePrice', 'originalPrice'],
    cardDisplay: { primary: 'bundle', badge: 'Bundle' },
  },
  cashback: {
    label: 'Cashback',
    hint: 'Reward or cashback offer.',
    requiredFields: ['discountPercent'],
    optionalFields: ['salePrice', 'couponCode'],
    cardDisplay: { primary: 'cashback', badge: 'Cashback' },
  },
  free: {
    label: 'Free',
    hint: 'Free item/trial offer.',
    requiredFields: [],
    optionalFields: ['couponCode'],
    cardDisplay: { primary: 'free', badge: 'Free' },
  },
  info: {
    label: 'Info',
    hint: 'Informational post with no strict pricing data.',
    requiredFields: [],
    optionalFields: [],
    cardDisplay: { primary: 'info', badge: 'Info' },
  },
};

export const DEFAULT_DEAL_TYPE: DealTypeCode = 'info';

export function isDealTypeCode(value: string): value is DealTypeCode {
  return DEAL_TYPE_CODES.includes(value as DealTypeCode);
}

export function getDealTypeConfig(value: string) {
  return isDealTypeCode(value) ? DEAL_TYPE_CONFIG[value] : DEAL_TYPE_CONFIG[DEFAULT_DEAL_TYPE];
}

export function getAllowedFields(value: string): DealFieldKey[] {
  const config = getDealTypeConfig(value);
  return [...config.requiredFields, ...config.optionalFields];
}
