import { apiFetch, setAuthToken } from "@/lib/apiClient";
import type { CustomerProfile } from "@/types/customer";

export interface SignupResult {
  token: string;
  role: "customer";
  profile: CustomerProfile;
}

export async function signup(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}): Promise<SignupResult> {
  const result = await apiFetch<SignupResult>("/auth/customer/signup", {
    method: "POST",
    body: input,
  });
  setAuthToken(result.token);
  return result;
}

export function getMyProfile(): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>("/customers/me", { auth: true });
}

export function updateMyProfile(input: {
  name?: string;
  phone?: string;
}): Promise<CustomerProfile> {
  return apiFetch<CustomerProfile>("/customers/me", {
    method: "PUT",
    auth: true,
    body: input,
  });
}

export function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  return apiFetch<void>("/customers/me/password", {
    method: "PUT",
    auth: true,
    body: input,
  });
}
