import { createClient } from '@/lib/supabase/server';

type MutationResult = {
  ok: boolean;
  error?: string;
};

async function getAuthenticatedProfileId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabase, profileId: user?.id ?? null };
}

export async function voteOnDeal(dealId: string, voteValue: 1 | -1): Promise<MutationResult> {
  const { supabase, profileId } = await getAuthenticatedProfileId();

  if (!profileId) {
    return { ok: false, error: 'Please sign in to vote.' };
  }

  const { data: existingVote, error: selectError } = await supabase
    .from('deal_votes')
    .select('id, vote_value')
    .eq('deal_id', dealId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (selectError) return { ok: false, error: selectError.message };

  let deltaUpvotes = 0;
  let deltaDownvotes = 0;
  let deltaScore = 0;

  if (!existingVote) {
    const { error: insertError } = await supabase.from('deal_votes').insert({ deal_id: dealId, profile_id: profileId, vote_value: voteValue });
    if (insertError) return { ok: false, error: insertError.message };

    deltaScore = voteValue;
    if (voteValue === 1) deltaUpvotes = 1;
    if (voteValue === -1) deltaDownvotes = 1;
  } else if (existingVote.vote_value === voteValue) {
    const { error: deleteError } = await supabase.from('deal_votes').delete().eq('id', existingVote.id);
    if (deleteError) return { ok: false, error: deleteError.message };

    deltaScore = -voteValue;
    if (voteValue === 1) deltaUpvotes = -1;
    if (voteValue === -1) deltaDownvotes = -1;
  } else {
    const { error: updateError } = await supabase.from('deal_votes').update({ vote_value: voteValue }).eq('id', existingVote.id);
    if (updateError) return { ok: false, error: updateError.message };

    deltaScore = voteValue * 2;
    if (voteValue === 1) {
      deltaUpvotes = 1;
      deltaDownvotes = -1;
    } else {
      deltaUpvotes = -1;
      deltaDownvotes = 1;
    }
  }

  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select('score, upvotes_count, downvotes_count')
    .eq('id', dealId)
    .single();

  if (dealError) return { ok: false, error: dealError.message };

  const { error: countError } = await supabase
    .from('deals')
    .update({
      score: deal.score + deltaScore,
      upvotes_count: Math.max(0, deal.upvotes_count + deltaUpvotes),
      downvotes_count: Math.max(0, deal.downvotes_count + deltaDownvotes),
    })
    .eq('id', dealId);

  if (countError) return { ok: false, error: countError.message };

  return { ok: true };
}

export async function addDealComment(dealId: string, body: string): Promise<MutationResult> {
  const { supabase, profileId } = await getAuthenticatedProfileId();

  if (!profileId) {
    return { ok: false, error: 'Please sign in to comment.' };
  }

  const normalizedBody = body.trim();
  if (!normalizedBody) {
    return { ok: false, error: 'Comment cannot be empty.' };
  }

  if (normalizedBody.length > 2000) {
    return { ok: false, error: 'Comment cannot exceed 2000 characters.' };
  }

  const { error: commentError } = await supabase.from('deal_comments').insert({ deal_id: dealId, profile_id: profileId, body: normalizedBody });
  if (commentError) return { ok: false, error: commentError.message };

  const { data: deal, error: dealError } = await supabase.from('deals').select('comments_count').eq('id', dealId).single();
  if (dealError) return { ok: false, error: dealError.message };

  const { error: countError } = await supabase
    .from('deals')
    .update({ comments_count: deal.comments_count + 1 })
    .eq('id', dealId);

  if (countError) return { ok: false, error: countError.message };

  return { ok: true };
}

export async function toggleDealSave(dealId: string): Promise<MutationResult> {
  const { supabase, profileId } = await getAuthenticatedProfileId();

  if (!profileId) {
    return { ok: false, error: 'Please sign in to save deals.' };
  }

  const { data: existingBookmark, error: selectError } = await supabase
    .from('deal_bookmarks')
    .select('id')
    .eq('deal_id', dealId)
    .eq('profile_id', profileId)
    .maybeSingle();

  if (selectError) return { ok: false, error: selectError.message };

  const { data: deal, error: dealError } = await supabase.from('deals').select('bookmarks_count').eq('id', dealId).single();
  if (dealError) return { ok: false, error: dealError.message };

  if (existingBookmark?.id) {
    const { error: deleteError } = await supabase.from('deal_bookmarks').delete().eq('id', existingBookmark.id);
    if (deleteError) return { ok: false, error: deleteError.message };

    const { error: updateError } = await supabase
      .from('deals')
      .update({ bookmarks_count: Math.max(0, deal.bookmarks_count - 1) })
      .eq('id', dealId);
    if (updateError) return { ok: false, error: updateError.message };
  } else {
    const { error: insertError } = await supabase.from('deal_bookmarks').insert({ deal_id: dealId, profile_id: profileId });
    if (insertError) return { ok: false, error: insertError.message };

    const { error: updateError } = await supabase.from('deals').update({ bookmarks_count: deal.bookmarks_count + 1 }).eq('id', dealId);
    if (updateError) return { ok: false, error: updateError.message };
  }

  return { ok: true };
}

export async function reportDeal(dealId: string, reason: string, details: string): Promise<MutationResult> {
  const { supabase, profileId } = await getAuthenticatedProfileId();

  if (!profileId) {
    return { ok: false, error: 'Please sign in to report deals.' };
  }

  const normalizedReason = reason.trim() || 'Other';

  const { error: reportError } = await supabase.from('deal_reports').insert({
    deal_id: dealId,
    profile_id: profileId,
    reason: normalizedReason,
    details: details.trim() || null,
  });

  if (reportError) return { ok: false, error: reportError.message };

  const { data: deal, error: dealError } = await supabase.from('deals').select('reports_count').eq('id', dealId).single();
  if (dealError) return { ok: false, error: dealError.message };

  const { error: updateError } = await supabase.from('deals').update({ reports_count: deal.reports_count + 1 }).eq('id', dealId);
  if (updateError) return { ok: false, error: updateError.message };

  return { ok: true };
}
