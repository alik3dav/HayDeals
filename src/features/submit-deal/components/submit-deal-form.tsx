'use client';

import { useActionState, useMemo, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/browser';
import { createDealAction } from '@/features/submit-deal/mutations';
import { DealPreviewCard } from '@/features/submit-deal/components/deal-preview-card';
import { FormField, SectionCard, inputStyles } from '@/features/submit-deal/components/form-field';
import type { SubmitDealActionState, SubmitDealMeta } from '@/features/submit-deal/types';

const INITIAL_STATE: SubmitDealActionState = {
  ok: false,
};

type SubmitDealFormProps = {
  meta: SubmitDealMeta;
};

function toPriceDisplay(value: string) {
  const asNumber = Number(value);

  if (!value || Number.isNaN(asNumber)) {
    return '';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(asNumber);
}

export function SubmitDealForm({ meta }: SubmitDealFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createDealAction, INITIAL_STATE);
  const [intent, setIntent] = useState<'draft' | 'submit'>('submit');
  const [uploadPending, startUploadTransition] = useTransition();

  const [imageUploadError, setImageUploadError] = useState('');
  const [values, setValues] = useState({
    title: '',
    description: '',
    dealUrl: '',
    couponCode: '',
    originalPrice: '',
    salePrice: '',
    categoryId: '',
    storeId: '',
    dealTypeId: '',
    dealTypeCode: '',
    expiresAt: '',
    imageUrl: '',
  });

  const selectedStore = meta.stores.find((store) => store.value === values.storeId);
  const selectedCategory = meta.categories.find((category) => category.value === values.categoryId);
  const selectedDealType = meta.dealTypes.find((dealType) => dealType.value === values.dealTypeId);

  const dealTypeCode = selectedDealType?.code ?? values.dealTypeCode;
  const requiresCoupon = dealTypeCode === 'coupon';
  const requiresFullPricing = dealTypeCode === 'discount' || dealTypeCode === 'bundle';

  const canSubmit = useMemo(() => !isPending && !uploadPending, [isPending, uploadPending]);

  const setField = (field: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  const onImageUpload = (file: File | null) => {
    if (!file) {
      return;
    }

    setImageUploadError('');

    startUploadTransition(async () => {
      const supabase = createClient();
      const extension = file.name.split('.').pop() || 'jpg';
      const path = `submissions/${Date.now()}-${crypto.randomUUID()}.${extension}`;

      const { error } = await supabase.storage.from('deal-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        setImageUploadError('Image upload failed. You can paste a direct image URL instead.');
        return;
      }

      const { data } = supabase.storage.from('deal-images').getPublicUrl(path);
      setField('imageUrl', data.publicUrl);
    });
  };

  return (
    <form action={formAction} className="space-y-4" ref={formRef}>
      <input name="intent" type="hidden" value={intent} />
      <input name="dealTypeCode" type="hidden" value={dealTypeCode} />

      <SectionCard description="Keep it concise and useful — your community will review this before it goes live." title="Submission details">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={state.errors?.title?.[0]} htmlFor="title" label="Title">
            <input className={inputStyles} id="title" name="title" onChange={(event) => setField('title', event.target.value)} value={values.title} />
          </FormField>

          <FormField error={state.errors?.dealUrl?.[0]} htmlFor="dealUrl" label="Deal URL">
            <input className={inputStyles} id="dealUrl" name="dealUrl" onChange={(event) => setField('dealUrl', event.target.value)} value={values.dealUrl} />
          </FormField>

          <div className="md:col-span-2">
            <FormField error={state.errors?.description?.[0]} htmlFor="description" label="Description">
              <textarea
                className={inputStyles}
                id="description"
                name="description"
                onChange={(event) => setField('description', event.target.value)}
                rows={4}
                value={values.description}
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <SectionCard description="Different deal types unlock different fields." title="Deal setup">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField error={state.errors?.dealTypeId?.[0]} htmlFor="dealTypeId" label="Deal type">
            <select
              className={inputStyles}
              id="dealTypeId"
              name="dealTypeId"
              onChange={(event) => {
                const id = event.target.value;
                const selected = meta.dealTypes.find((dealType) => dealType.value === id);
                setValues((previous) => ({ ...previous, dealTypeId: id, dealTypeCode: selected?.code ?? '' }));
              }}
              value={values.dealTypeId}
            >
              <option value="">Select type</option>
              {meta.dealTypes.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField error={state.errors?.categoryId?.[0]} htmlFor="categoryId" label="Category">
            <select className={inputStyles} id="categoryId" name="categoryId" onChange={(event) => setField('categoryId', event.target.value)} value={values.categoryId}>
              <option value="">Select category</option>
              {meta.categories.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField error={state.errors?.storeId?.[0]} htmlFor="storeId" label="Store">
            <select className={inputStyles} id="storeId" name="storeId" onChange={(event) => setField('storeId', event.target.value)} value={values.storeId}>
              <option value="">Select store</option>
              {meta.stores.map((option) => (
                <option key={option.id} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField error={state.errors?.originalPrice?.[0]} hint={requiresFullPricing ? 'Required for this deal type.' : 'Optional'} htmlFor="originalPrice" label="Original price">
            <input className={inputStyles} id="originalPrice" name="originalPrice" onChange={(event) => setField('originalPrice', event.target.value)} value={values.originalPrice} />
          </FormField>

          <FormField error={state.errors?.salePrice?.[0]} hint={requiresFullPricing ? 'Required for this deal type.' : 'Optional'} htmlFor="salePrice" label="Sale price">
            <input className={inputStyles} id="salePrice" name="salePrice" onChange={(event) => setField('salePrice', event.target.value)} value={values.salePrice} />
          </FormField>

          <FormField error={state.errors?.couponCode?.[0]} hint={requiresCoupon ? 'Required for coupon deals.' : 'Optional'} htmlFor="couponCode" label="Coupon code">
            <input className={inputStyles} id="couponCode" name="couponCode" onChange={(event) => setField('couponCode', event.target.value)} value={values.couponCode} />
          </FormField>

          <FormField error={state.errors?.expiresAt?.[0]} hint="Optional. Must be in the future." htmlFor="expiresAt" label="Expiration">
            <input
              className={inputStyles}
              id="expiresAt"
              name="expiresAt"
              onChange={(event) => setField('expiresAt', event.target.value)}
              type="datetime-local"
              value={values.expiresAt}
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard description="Upload to Supabase Storage (deal-images bucket) or paste a direct URL." title="Image">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField error={state.errors?.imageUrl?.[0]} htmlFor="imageUrl" label="Image URL">
            <input className={inputStyles} id="imageUrl" name="imageUrl" onChange={(event) => setField('imageUrl', event.target.value)} value={values.imageUrl} />
          </FormField>

          <FormField error={imageUploadError} htmlFor="imageUpload" label="Upload image">
            <input className={inputStyles} id="imageUpload" onChange={(event) => onImageUpload(event.target.files?.[0] ?? null)} type="file" />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard description="Horizontal feed-style preview of how your post may render." title="Preview">
        <DealPreviewCard
          categoryLabel={selectedCategory?.label ?? ''}
          couponCode={values.couponCode}
          dealTypeLabel={selectedDealType?.label ?? ''}
          dealUrl={values.dealUrl}
          description={values.description}
          imageUrl={values.imageUrl}
          originalPrice={toPriceDisplay(values.originalPrice)}
          salePrice={toPriceDisplay(values.salePrice)}
          storeLabel={selectedStore?.label ?? ''}
          title={values.title}
        />
      </SectionCard>

      {state.message ? (
        <p className={state.ok ? 'text-sm text-emerald-400' : 'text-sm text-destructive'}>{state.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button disabled={!canSubmit} name="intentDraft" onClick={() => setIntent('draft')} type="submit" variant="secondary">
          Save draft
        </Button>
        <Button disabled={!canSubmit} onClick={() => setIntent('submit')} type="submit">
          Submit for review
        </Button>
      </div>
    </form>
  );
}
