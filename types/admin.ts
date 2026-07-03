export type AdminRole = "admin";

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  avatarUrl: string | null;
}

export interface AdminUser {
  uid: string;
  email: string | null;
}
