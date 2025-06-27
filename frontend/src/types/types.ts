export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  profile_picture: string;
  created_at: Date;
}

export interface Workspace {
  id: number;
  name: string;
  slug: string;
  logo: React.ElementType;
}
