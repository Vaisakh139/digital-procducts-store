const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const isApiConfigured = Boolean(API_BASE_URL);

export const ADMIN_TOKEN_STORAGE_KEY = "elicso:admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function setAdminToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
  else window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export class ApiError extends Error {
  status: number;
  errors: unknown;

  constructor(message: string, status: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
}

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, auth = false, signal }: ApiFetchOptions = {},
): Promise<T> {
  if (!isApiConfigured) {
    throw new ApiError(
      "The API is not configured. Add NEXT_PUBLIC_API_URL to .env.local.",
      0,
    );
  }

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getAdminToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError("Could not reach the server. Please try again.", 0);
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    // No/invalid JSON body — fall through to the status-based error below.
  }

  if (!response.ok || !payload || !payload.success) {
    throw new ApiError(
      payload?.message ?? `Request failed with status ${response.status}.`,
      response.status,
      payload?.errors,
    );
  }

  return payload.data as T;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}
