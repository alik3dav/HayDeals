import { createClient } from '@/lib/supabase/server';

type AwardPointsParams = {
  profileId: string;
  actionType: string;
  pointsAmount: number;
  relatedEntityType?: string;
  relatedEntityId?: string;
};

export async function awardPointsLogEntry(params: AwardPointsParams): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('award_profile_points', {
    p_profile_id: params.profileId,
    p_action_type: params.actionType,
    p_points_amount: params.pointsAmount,
    p_related_entity_type: params.relatedEntityType ?? null,
    p_related_entity_id: params.relatedEntityId ?? null,
  });

  if (error) {
    throw error;
  }

  return Boolean(data);
}
