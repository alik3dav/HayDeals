'use client';

import { useActionState, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { RichTextArea } from '@/components/ui/rich-textarea';
import { createDealAction } from '@/features/submit-deal/mutations';
import { DEAL_FIELD_META, getAllowedFields, getDealTypeConfig } from '@/features/submit-deal/deal-type-config';
import { DealImageUpload } from '@/features/submit-deal/components/deal-image-upload';
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

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(asNumber);
}

export function SubmitDealForm({ meta }: SubmitDealFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createDealAction, INITIAL_STATE);
  const [intent, setIntent] = useState<'draft' | 'submit'>('submit');

  const [values, setValues] = useState({
    title: '',
    description: '',
    dealUrl: '',
    couponCode: '',
    bundleText: '',
    originalPrice: '',
    salePrice: '',
    discountPercent: '',
    categoryId: '',
    storeId: '',
    dealTypeId: '',
    dealTypeCode: '',
    expiresAt: '',
    imageUrl: '',
    availabilityScope: 'worldwide' as 'worldwide' | 'region' | 'country',
    availabilityRegion: '',
    availabilityCountryCode: '',
  });

  const selectedStore = meta.stores.find((store) => store.value === values.storeId);
  const selectedCategory = meta.categories.find((category) => category.value === values.categoryId);
  const selectedDealType = meta.dealTypes.find((dealType) => dealType.value === values.dealTypeId);

  const dealTypeCode = selectedDealType?.code ?? values.dealTypeCode;
  const dealTypeConfig = getDealTypeConfig(dealTypeCode);
  const visibleDealFields = getAllowedFields(dealTypeCode);

  const setField = (field: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <form action={formAction} className="space-y-5" ref={formRef}>
      <input name="intent" type="hidden" value={intent} />
      <input name="dealTypeCode" type="hidden" value={dealTypeCode} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-5">
          <SectionCard description="Write a clear headline and direct URL so members can validate the offer quickly." title="Core details">
            <div className="grid gap-4">
              <FormField error={state.errors?.title?.[0]} htmlFor="title" label="Deal title">
                <input className={inputStyles} id="title" name="title" onChange={(event) => setField('title', event.target.value)} placeholder="e.g., Apple AirPods Pro 2 for $169 at Best Buy" value={values.title} />
              </FormField>

              <FormField error={state.errors?.dealUrl?.[0]} htmlFor="dealUrl" label="Deal URL">
                <input className={inputStyles} id="dealUrl" name="dealUrl" onChange={(event) => setField('dealUrl', event.target.value)} placeholder="https://" value={values.dealUrl} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard description="Only fields that matter for the selected deal type are shown." title="Pricing & value">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField error={state.errors?.dealTypeId?.[0]} htmlFor="dealTypeId" label="Deal type">
                <select
                  className={inputStyles}
                  id="dealTypeId"
                  name="dealTypeId"
                  onChange={(event) => {
                    const id = event.target.value;
                    const selected = meta.dealTypes.find((dealType) => dealType.value === id);
                    const nextCode = selected?.code ?? '';
                    const allowed = new Set(getAllowedFields(nextCode));

                    setValues((previous) => ({
                      ...previous,
                      dealTypeId: id,
                      dealTypeCode: nextCode,
                      couponCode: allowed.has('couponCode') ? previous.couponCode : '',
                      bundleText: allowed.has('bundleText') ? previous.bundleText : '',
                      originalPrice: allowed.has('originalPrice') ? previous.originalPrice : '',
                      salePrice: allowed.has('salePrice') ? previous.salePrice : '',
                      discountPercent: allowed.has('discountPercent') ? previous.discountPercent : '',
                    }));
                  }}
                  value={values.dealTypeId}
                >
                  <option value="">Select deal type</option>
                  {meta.dealTypes.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField error={state.errors?.expiresAt?.[0]} hint="Optional future date." htmlFor="expiresAt" label="Expiration">
                <input
                  className={inputStyles}
                  id="expiresAt"
                  name="expiresAt"
                  onChange={(event) => setField('expiresAt', event.target.value)}
                  type="datetime-local"
                  value={values.expiresAt}
                />
              </FormField>

              {visibleDealFields.map((field) => (
                <FormField
                  key={field}
                  error={state.errors?.[field]?.[0]}
                  hint={dealTypeConfig.requiredFields.includes(field) ? 'Required for this type.' : 'Optional'}
                  htmlFor={field}
                  label={DEAL_FIELD_META[field].label}
                >
                  <input
                    className={inputStyles}
                    id={field}
                    inputMode={DEAL_FIELD_META[field].inputMode}
                    name={field}
                    onChange={(event) => setField(field, event.target.value)}
                    placeholder={DEAL_FIELD_META[field].placeholder}
                    value={values[field]}
                  />
                </FormField>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">{dealTypeConfig.hint}</p>
          </SectionCard>

          <SectionCard description="Associate the deal with optional entities to improve discovery and filtering." title="Metadata">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField error={state.errors?.categoryId?.[0]} hint="Optional" htmlFor="categoryId" label="Category">
                <select className={inputStyles} id="categoryId" name="categoryId" onChange={(event) => setField('categoryId', event.target.value)} value={values.categoryId}>
                  <option value="">{meta.categories.length ? 'Select category' : 'No categories available'}</option>
                  {meta.categories.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField error={state.errors?.storeId?.[0]} hint="Optional" htmlFor="storeId" label="Store">
                <select className={inputStyles} id="storeId" name="storeId" onChange={(event) => setField('storeId', event.target.value)} value={values.storeId}>
                  <option value="">{meta.stores.length ? 'Select store' : 'No stores available'}</option>
                  {meta.stores.map((option) => (
                    <option key={option.id} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          </SectionCard>

          <SectionCard description="Define where users can actually redeem or use this deal." title="Availability">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField error={state.errors?.availabilityScope?.[0]} htmlFor="availabilityScope" label="Availability type">
                <select
                  className={inputStyles}
                  id="availabilityScope"
                  name="availabilityScope"
                  onChange={(event) => {
                    const scope = event.target.value as 'worldwide' | 'region' | 'country';
                    setValues((previous) => ({
                      ...previous,
                      availabilityScope: scope,
                      availabilityRegion: scope === 'region' ? previous.availabilityRegion : '',
                      availabilityCountryCode: scope === 'country' ? previous.availabilityCountryCode : '',
                    }));
                  }}
                  value={values.availabilityScope}
                >
                  {meta.availabilityScopes.map((scope) => (
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
                    </option>
                  ))}
                </select>
              </FormField>

              {values.availabilityScope === 'region' ? (
                <FormField error={state.errors?.availabilityRegion?.[0]} htmlFor="availabilityRegion" label="Region">
                  <select
                    className={inputStyles}
                    id="availabilityRegion"
                    name="availabilityRegion"
                    onChange={(event) => setField('availabilityRegion', event.target.value)}
                    value={values.availabilityRegion}
                  >
                    <option value="">Select region</option>
                    {meta.availabilityRegions.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : null}

              {values.availabilityScope === 'country' ? (
                <FormField error={state.errors?.availabilityCountryCode?.[0]} htmlFor="availabilityCountryCode" label="Country">
                  <select
                    className={inputStyles}
                    id="availabilityCountryCode"
                    name="availabilityCountryCode"
                    onChange={(event) => setField('availabilityCountryCode', event.target.value)}
                    value={values.availabilityCountryCode}
                  >
                    <option value="">Select country</option>
                    {meta.availabilityCountries.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard description="Explain why this is worth posting. Mention shipping, limits, or timing if needed." title="Description">
            <FormField error={state.errors?.description?.[0]} htmlFor="description" label="Post details">
              <RichTextArea
                className={inputStyles}
                id="description"
                name="description"
                onChange={(event) => setField('description', event.target.value)}
                placeholder="Share key details that help others decide quickly."
                rows={7}
                value={values.description}
              />
            </FormField>
          </SectionCard>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-20">
          <SectionCard description="One main image improves trust and feed engagement." title="Deal image">
            <DealImageUpload error={state.errors?.imageUrl?.[0]} onChange={(nextUrl) => setField('imageUrl', nextUrl)} value={values.imageUrl} />
            <input name="imageUrl" type="hidden" value={values.imageUrl} />
          </SectionCard>

          <SectionCard description="Feed-style preview of how your deal can appear." title="Preview">
            <DealPreviewCard
              bundleText={values.bundleText}
              categoryLabel={selectedCategory?.label ?? ''}
              couponCode={values.couponCode}
              dealTypeCode={dealTypeCode}
              dealTypeLabel={selectedDealType?.label ?? ''}
              dealUrl={values.dealUrl}
              description={values.description}
              discountPercent={values.discountPercent}
              imageUrl={values.imageUrl}
              originalPrice={toPriceDisplay(values.originalPrice)}
              salePrice={toPriceDisplay(values.salePrice)}
              storeLabel={selectedStore?.label ?? ''}
              title={values.title}
              availabilityScope={values.availabilityScope}
              availabilityRegion={values.availabilityRegion}
              availabilityCountryCode={values.availabilityCountryCode}
            />
          </SectionCard>
        </aside>
      </div>

      {state.message ? <p className={state.ok ? 'text-sm text-emerald-400' : 'text-sm text-destructive'}>{state.message}</p> : null}

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
        <Button disabled={isPending} name="intentDraft" onClick={() => setIntent('draft')} type="submit" variant="secondary">
          Save draft
        </Button>
        <Button disabled={isPending} onClick={() => setIntent('submit')} type="submit">
          Submit for review
        </Button>
      </div>
    </form>
  );
}
