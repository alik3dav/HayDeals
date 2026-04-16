export type NotificationType = 'deal_comment' | 'deal_upvote' | 'deal_moderation_approved' | 'deal_moderation_rejected';

export type NotificationActor = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

export type NotificationDeal = {
  id: string;
  slug: string;
  title: string;
};

export type UserNotification = {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
  dealId: string | null;
  dealSlug: string | null;
  targetType: string | null;
  targetId: string | null;
  actor: NotificationActor | null;
  deal: NotificationDeal | null;
};
