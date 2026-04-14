import { z } from 'zod';

import { getAllowedFields, getDealTypeConfig, isDealTypeCode } from '@/features/submit-deal/deal-type-config';

const NUMERIC_FIELDS = ['originalPrice', 'salePrice', 'discountPercent'] as const;
const CONDITIONAL_FIELDS = ['originalPrice', 'salePrice', 'discountPercent', 'couponCode', 'bundleText'] as const;

export const submitDealBaseSchema = z.object({
  title: z.string().trim().min(8, 'Title must be at least 8 characters.').max(140, 'Title cannot exceed 140 characters.'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(1200, 'Description cannot exceed 1200 characters.'),
  dealUrl: z.string().trim().url('Please provide a valid deal URL.'),
  couponCode: z.string().trim().max(100, 'Coupon code is too long.').optional().or(z.literal('')),
  bundleText: z.string().trim().max(120, 'Bundle text is too long.').optional().or(z.literal('')),
  originalPrice: z.string().trim().optional().or(z.literal('')),
  salePrice: z.string().trim().optional().or(z.literal('')),
  discountPercent: z.string().trim().optional().or(z.literal('')),
  categoryId: z.string().uuid('Please select a valid category.').optional().or(z.literal('')),
  storeId: z.string().uuid('Please select a valid store.').optional().or(z.literal('')),
  dealTypeId: z.string().uuid('Please select a deal type.'),
  dealTypeCode: z.string().trim().min(1, 'Deal type metadata is required.'),
  expiresAt: z.string().trim().optional().or(z.literal('')),
  imageUrl: z.string().trim().url('Image URL must be a valid URL.').optional().or(z.literal('')),
  intent: z.enum(['draft', 'submit']),
});

export const submitDealSchema = submitDealBaseSchema.superRefine((value, ctx) => {
  const dealType = value.dealTypeCode;

  if (!isDealTypeCode(dealType)) {
    ctx.addIssue({ code: 'custom', path: ['dealTypeCode'], message: 'Unsupported deal type.' });
    return;
  }

  const parsedNumbers = {
    originalPrice: value.originalPrice ? Number(value.originalPrice) : null,
    salePrice: value.salePrice ? Number(value.salePrice) : null,
    discountPercent: value.discountPercent ? Number(value.discountPercent) : null,
  };

  if (value.expiresAt) {
    const expiresDate = new Date(value.expiresAt);

    if (Number.isNaN(expiresDate.getTime()) || expiresDate.getTime() <= Date.now()) {
      ctx.addIssue({
        code: 'custom',
        path: ['expiresAt'],
        message: 'Expiration must be a valid future date.',
      });
    }
  }

  if (value.imageUrl && !/^https?:\/\//i.test(value.imageUrl)) {
    ctx.addIssue({ code: 'custom', path: ['imageUrl'], message: 'Image URL must start with http:// or https://.' });
  }

  for (const key of NUMERIC_FIELDS) {
    if ((value[key] ?? '') && Number.isNaN(parsedNumbers[key])) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'Must be a valid number.' });
    }

    if (parsedNumbers[key] !== null && parsedNumbers[key] < 0) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'Value cannot be negative.' });
    }
  }

  if (parsedNumbers.discountPercent !== null && parsedNumbers.discountPercent > 100) {
    ctx.addIssue({ code: 'custom', path: ['discountPercent'], message: 'Discount percent must be between 0 and 100.' });
  }

  if (parsedNumbers.originalPrice !== null && parsedNumbers.salePrice !== null && parsedNumbers.salePrice > parsedNumbers.originalPrice) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Sale price must be less than or equal to original price.' });
  }

  const config = getDealTypeConfig(dealType);

  for (const field of config.requiredFields) {
    if (!(value[field] ?? '').trim()) {
      ctx.addIssue({ code: 'custom', path: [field], message: `${field} is required for ${config.label} deals.` });
    }
  }

  const allowed = new Set(getAllowedFields(dealType));

  for (const field of CONDITIONAL_FIELDS) {
    if (!allowed.has(field) && (value[field] ?? '').trim()) {
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: `Remove ${field}; it does not apply to ${config.label} deals.`,
      });
    }
  }
});

export type SubmitDealInput = z.infer<typeof submitDealSchema>;
