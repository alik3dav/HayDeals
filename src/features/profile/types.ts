export type ProfileSettings = {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  points_total: number;
};

export type UserIdentity = {
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  email: string | null;
};

export type UpdateProfileState = {
  ok: boolean;
  message: string;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    avatarUrl?: string[];
  };
};
