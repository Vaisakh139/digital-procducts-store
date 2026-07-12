import { apiFetch, ApiError, setAuthToken } from "@/lib/apiClient";

export type AuthRole = "admin" | "customer";

export interface LoginResult {
  token: string;
  role: AuthRole;
  profile: {
    id: string;
    name: string;
    email: string;
    role?: string;
    phone?: string | null;
  };
}

export async function loginWithEmail(
  email: string,
  password: string,
  remember: boolean,
): Promise<LoginResult> {
  const result = await apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  setAuthToken(result.token, remember);
  return result;
}

export async function logout(): Promise<void> {
  setAuthToken(null);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
