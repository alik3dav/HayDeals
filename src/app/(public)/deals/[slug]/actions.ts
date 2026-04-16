'use server';

import { revalidatePath } from 'next/cache';

import { addDealComment, reportDeal, toggleDealSave, voteOnDeal } from '@/features/deal-details/mutations';

function refresh(dealSlug: string) {
  revalidatePath(`/deals/${dealSlug}`);
  revalidatePath('/');
}

export async function voteOnDealAction(dealId: string, dealSlug: string, voteValue: 1 | -1) {
  const result = await voteOnDeal(dealId, voteValue);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to submit vote.');
  }

  refresh(dealSlug);
}

export async function addCommentAction(dealId: string, dealSlug: string, formData: FormData) {
  const body = String(formData.get('body') ?? '');
  const result = await addDealComment(dealId, body);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to submit comment.');
  }

  refresh(dealSlug);
}

export async function toggleSaveAction(dealId: string, dealSlug: string) {
  const result = await toggleDealSave(dealId);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to save deal.');
  }

  refresh(dealSlug);
}

export async function reportDealAction(dealId: string, dealSlug: string, formData: FormData) {
  const reason = String(formData.get('reason') ?? 'other');
  const details = String(formData.get('details') ?? '');

  const result = await reportDeal(dealId, reason, details);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to report deal.');
  }

  refresh(dealSlug);
}
