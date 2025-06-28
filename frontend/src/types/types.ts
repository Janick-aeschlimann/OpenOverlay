export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  profile_picture: string;
  created_at: Date;
}

export interface Workspace {
  workspaceId: number;
  name: string;
  slug: string;
  logo: string | null;
  ownerId: string;
  access: string;
}
