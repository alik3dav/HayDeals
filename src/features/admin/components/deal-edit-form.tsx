'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { updateDealAction } from '@/features/admin/mutations';
import type { AdminDealEdit } from '@/features/admin/types';
import { COUNTRY_SELECT_OPTIONS, REGION_OPTIONS } from '@/features/deals/availability';
import { DealImageUpload } from '@/features/submit-deal/components/deal-image-upload';
import { DealPreviewCard } from '@/features/submit-deal/components/deal-preview-card';
import { DEAL_FIELD_META, getAllowedFields, getDealTypeConfig } from '@/features/submit-deal/deal-type-config';
import { FormField, SectionCard, inputStyles } from '@/features/submit-deal/components/form-field';

function toPriceDisplay(value: string) {
  const asNumber = Number(value);

  if (!value || Number.isNaN(asNumber)) {
    return '';
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(asNumber);
}

export function DealEditForm({ deal }: { deal: AdminDealEdit }) {
  const [values, setValues] = useState({
    title: deal.title,
    description: deal.description ?? '',
    dealUrl: deal.deal_url,
    couponCode: deal.coupon_code ?? '',
    bundleText: deal.bundle_text ?? '',
    originalPrice: deal.original_price?.toString() ?? '',
    salePrice: deal.sale_price?.toString() ?? '',
    discountPercent: deal.discount_percent?.toString() ?? '',
    categoryId: deal.category_id ?? '',
    storeId: deal.store_id ?? '',
    dealTypeId: deal.deal_type_id,
    expiresAt: deal.expires_at ? deal.expires_at.slice(0, 16) : '',
    imageUrl: deal.image_url ?? '',
    availabilityScope: deal.availability_scope,
    availabilityRegion: deal.availability_region ?? '',
    availabilityCountryCode: deal.availability_country_code ?? '',
    moderationStatus: deal.moderation_status,
    moderationNote: deal.moderation_note ?? '',
  });
  const [isFeatured, setIsFeatured] = useState(deal.is_featured);

  const selectedStore = useMemo(() => deal.storeOptions.find((store) => store.id === values.storeId), [deal.storeOptions, values.storeId]);
  const selectedCategory = useMemo(() => deal.categoryOptions.find((category) => category.id === values.categoryId), [deal.categoryOptions, values.categoryId]);
  const selectedDealType = useMemo(() => deal.dealTypeOptions.find((dealType) => dealType.id === values.dealTypeId), [deal.dealTypeOptions, values.dealTypeId]);

  const dealTypeCode = selectedDealType?.code ?? 'info';
  const dealTypeConfig = getDealTypeConfig(dealTypeCode);
  const visibleDealFields = getAllowedFields(dealTypeCode);

  const setField = (field: keyof typeof values, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
  };

  return (
    <form action={updateDealAction} className="space-y-5">
      <input name="dealId" type="hidden" value={deal.id} />
      <input name="imageUrl" type="hidden" value={values.imageUrl} />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)] lg:items-start">
        <div className="min-w-0 space-y-5">
          <SectionCard description="Write a clear headline and direct URL so members can validate the offer quickly." title="Core details">
            <div className="grid gap-4">
              <FormField htmlFor="title" label="Deal title">
                <input className={inputStyles} id="title" name="title" onChange={(event) => setField('title', event.target.value)} required value={values.title} />
              </FormField>

              <FormField htmlFor="dealUrl" label="Deal URL">
                <input className={inputStyles} id="dealUrl" name="dealUrl" onChange={(event) => setField('dealUrl', event.target.value)} required value={values.dealUrl} />
              </FormField>
            </div>
          </SectionCard>

          <SectionCard description="Same structure as deal submission, with all current values loaded from the database." title="Pricing & value">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="dealTypeId" label="Deal type">
                <select
                  className={inputStyles}
                  id="dealTypeId"
                  name="dealTypeId"
                  onChange={(event) => {
                    const id = event.target.value;
                    const selected = deal.dealTypeOptions.find((dealType) => dealType.id === id);
                    const nextCode = selected?.code ?? 'info';
                    const allowed = new Set(getAllowedFields(nextCode));

                    setValues((previous) => ({
                      ...previous,
                      dealTypeId: id,
                      couponCode: allowed.has('couponCode') ? previous.couponCode : '',
                      bundleText: allowed.has('bundleText') ? previous.bundleText : '',
                      originalPrice: allowed.has('originalPrice') ? previous.originalPrice : '',
                      salePrice: allowed.has('salePrice') ? previous.salePrice : '',
                      discountPercent: allowed.has('discountPercent') ? previous.discountPercent : '',
                    }));
                  }}
                  value={values.dealTypeId}
                >
                  {deal.dealTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField hint="Optional future date." htmlFor="expiresAt" label="Expiration">
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
                <FormField key={field} hint={dealTypeConfig.requiredFields.includes(field) ? 'Required for this type.' : 'Optional'} htmlFor={field} label={DEAL_FIELD_META[field].label}>
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

          <SectionCard description="Associate entities and moderation controls for discovery and workflow." title="Metadata & moderation">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField hint="Optional" htmlFor="categoryId" label="Category">
                <select className={inputStyles} id="categoryId" name="categoryId" onChange={(event) => setField('categoryId', event.target.value)} value={values.categoryId}>
                  <option value="">No category</option>
                  {deal.categoryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField hint="Optional" htmlFor="storeId" label="Store">
                <select className={inputStyles} id="storeId" name="storeId" onChange={(event) => setField('storeId', event.target.value)} value={values.storeId}>
                  <option value="">No store</option>
                  {deal.storeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField htmlFor="moderationStatus" label="Moderation status">
                <select className={inputStyles} id="moderationStatus" name="moderationStatus" onChange={(event) => setField('moderationStatus', event.target.value)} value={values.moderationStatus}>
                  <option value="draft">draft</option>
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </FormField>

              <FormField htmlFor="isFeatured" label="Featured">
                <label className="flex h-10 items-center gap-2 rounded-md border border-input px-3 text-sm">
                  <input checked={isFeatured} id="isFeatured" name="isFeatured" onChange={(event) => setIsFeatured(event.target.checked)} type="checkbox" />
                  Mark as featured deal
                </label>
              </FormField>
            </div>

            <FormField htmlFor="moderationNote" label="Moderation note">
              <textarea className={inputStyles} id="moderationNote" name="moderationNote" onChange={(event) => setField('moderationNote', event.target.value)} rows={3} value={values.moderationNote} />
            </FormField>
          </SectionCard>

          <SectionCard description="Define where users can redeem or use this deal." title="Availability">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField htmlFor="availabilityScope" label="Availability type">
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
                  <option value="worldwide">Worldwide</option>
                  <option value="region">Region</option>
                  <option value="country">Country</option>
                </select>
              </FormField>

              {values.availabilityScope === 'region' ? (
                <FormField htmlFor="availabilityRegion" label="Region">
                  <select
                    className={inputStyles}
                    id="availabilityRegion"
                    name="availabilityRegion"
                    onChange={(event) => setField('availabilityRegion', event.target.value)}
                    value={values.availabilityRegion}
                  >
                    <option value="">Select region</option>
                    {REGION_OPTIONS.map((region) => (
                      <option key={region.value} value={region.value}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : null}

              {values.availabilityScope === 'country' ? (
                <FormField htmlFor="availabilityCountryCode" label="Country">
                  <select
                    className={inputStyles}
                    id="availabilityCountryCode"
                    name="availabilityCountryCode"
                    onChange={(event) => setField('availabilityCountryCode', event.target.value)}
                    value={values.availabilityCountryCode}
                  >
                    <option value="">Select country</option>
                    {COUNTRY_SELECT_OPTIONS.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </FormField>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard description="Explain why this is worth posting and include important constraints." title="Description">
            <FormField htmlFor="description" label="Post details">
              <textarea className={inputStyles} id="description" name="description" onChange={(event) => setField('description', event.target.value)} rows={7} value={values.description} />
            </FormField>
          </SectionCard>
        </div>

        <aside className="min-w-0 space-y-5 lg:sticky lg:top-20">
          <SectionCard description="Replace or remove the current deal image." title="Deal image">
            <DealImageUpload onChange={(nextUrl) => setField('imageUrl', nextUrl)} value={values.imageUrl} />
          </SectionCard>

          <SectionCard description="Live preview of how this deal appears." title="Preview">
            <DealPreviewCard
              availabilityCountryCode={values.availabilityCountryCode}
              availabilityRegion={values.availabilityRegion}
              availabilityScope={values.availabilityScope}
              bundleText={values.bundleText}
              categoryLabel={selectedCategory?.name ?? ''}
              couponCode={values.couponCode}
              dealTypeCode={dealTypeCode}
              dealTypeLabel={selectedDealType?.label ?? ''}
              dealUrl={values.dealUrl}
              description={values.description}
              discountPercent={values.discountPercent}
              imageUrl={values.imageUrl}
              originalPrice={toPriceDisplay(values.originalPrice)}
              salePrice={toPriceDisplay(values.salePrice)}
              storeLabel={selectedStore?.name ?? ''}
              title={values.title}
            />
          </SectionCard>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
        <Button type="submit">Save changes</Button>
      </div>
    </form>
  );
}
