export type DashboardOverviewStats = {
  submittedDeals: number;
  approvedDeals: number;
  pendingDeals: number;
  savedDeals: number;
  commentsPosted: number;
};

export type DashboardDealListItem = {
  id: string;
  title: string;
  created_at: string;
  moderation_status: 'pending' | 'approved' | 'rejected';
  score: number;
  comments_count: number;
};

export type DashboardSavedDealListItem = {
  id: string;
  title: string;
  created_at: string;
  score: number;
  comments_count: number;
  bookmarked_at: string;
};

export type DashboardCommentActivityItem = {
  id: string;
  body: string;
  created_at: string;
  deal: {
    id: string;
    title: string;
  } | null;
};

export type DashboardOverviewData = {
  stats: DashboardOverviewStats;
  recentDeals: DashboardDealListItem[];
  recentSavedDeals: DashboardSavedDealListItem[];
  recentComments: DashboardCommentActivityItem[];
};
