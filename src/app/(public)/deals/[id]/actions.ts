'use server';

import { revalidatePath } from 'next/cache';

import { addDealComment, reportDeal, toggleDealSave, voteOnDeal } from '@/features/deal-details/mutations';

function refresh(dealId: string) {
  revalidatePath(`/deals/${dealId}`);
  revalidatePath('/');
}

export async function voteOnDealAction(dealId: string, voteValue: 1 | -1) {
  const result = await voteOnDeal(dealId, voteValue);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to submit vote.');
  }

  refresh(dealId);
}

export async function addCommentAction(dealId: string, formData: FormData) {
  const body = String(formData.get('body') ?? '');
  const result = await addDealComment(dealId, body);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to submit comment.');
  }

  refresh(dealId);
}

export async function toggleSaveAction(dealId: string) {
  const result = await toggleDealSave(dealId);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to save deal.');
  }

  refresh(dealId);
}

export async function reportDealAction(dealId: string, formData: FormData) {
  const reason = String(formData.get('reason') ?? 'other');
  const details = String(formData.get('details') ?? '');

  const result = await reportDeal(dealId, reason, details);

  if (!result.ok) {
    throw new Error(result.error ?? 'Unable to report deal.');
  }

  refresh(dealId);
}
