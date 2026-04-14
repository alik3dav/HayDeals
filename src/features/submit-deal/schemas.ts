import { z } from 'zod';

export const submitDealBaseSchema = z.object({
  title: z.string().trim().min(8, 'Title must be at least 8 characters.').max(140, 'Title cannot exceed 140 characters.'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters.').max(1200, 'Description cannot exceed 1200 characters.'),
  dealUrl: z.string().trim().url('Please provide a valid deal URL.'),
  couponCode: z.string().trim().max(100, 'Coupon code is too long.').optional().or(z.literal('')),
  originalPrice: z.string().trim().optional().or(z.literal('')),
  salePrice: z.string().trim().optional().or(z.literal('')),
  categoryId: z.string().uuid('Please select a valid category.').optional().or(z.literal('')),
  storeId: z.string().uuid('Please select a valid store.').optional().or(z.literal('')),
  dealTypeId: z.string().uuid('Please select a deal type.'),
  dealTypeCode: z.string().trim().min(1, 'Deal type metadata is required.'),
  expiresAt: z.string().trim().optional().or(z.literal('')),
  imageUrl: z.string().trim().url('Image URL must be a valid URL.').optional().or(z.literal('')),
  intent: z.enum(['draft', 'submit']),
});

export const submitDealSchema = submitDealBaseSchema.superRefine((value, ctx) => {
  const coupon = value.couponCode?.trim() ?? '';
  const dealType = value.dealTypeCode;
  const originalPrice = value.originalPrice ? Number(value.originalPrice) : null;
  const salePrice = value.salePrice ? Number(value.salePrice) : null;

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

  if ((value.originalPrice && Number.isNaN(originalPrice)) || (value.salePrice && Number.isNaN(salePrice))) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Prices must be valid numbers.' });
    return;
  }

  if (originalPrice !== null && originalPrice < 0) {
    ctx.addIssue({ code: 'custom', path: ['originalPrice'], message: 'Original price cannot be negative.' });
  }

  if (salePrice !== null && salePrice < 0) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Sale price cannot be negative.' });
  }

  if (originalPrice !== null && salePrice !== null && salePrice > originalPrice) {
    ctx.addIssue({ code: 'custom', path: ['salePrice'], message: 'Sale price must be less than or equal to original price.' });
  }

  if ((dealType === 'discount' || dealType === 'bundle') && (originalPrice === null || salePrice === null)) {
    ctx.addIssue({
      code: 'custom',
      path: ['salePrice'],
      message: 'Discount and bundle deals require both original and sale prices.',
    });
  }

  if (dealType === 'coupon' && coupon.length < 3) {
    ctx.addIssue({ code: 'custom', path: ['couponCode'], message: 'Coupon deals require a valid coupon code.' });
  }

  if (dealType === 'cashback' && !value.description.toLowerCase().includes('cashback')) {
    ctx.addIssue({
      code: 'custom',
      path: ['description'],
      message: 'Cashback deals should mention cashback details in the description.',
    });
  }
});

export type SubmitDealInput = z.infer<typeof submitDealSchema>;
