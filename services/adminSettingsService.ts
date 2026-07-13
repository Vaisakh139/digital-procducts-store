import { apiFetch } from "@/lib/apiClient";
import type { AdminSettings, AdminSettingsInput } from "@/types/adminSettings";

interface RawSettings extends Omit<AdminSettings, "updatedAt"> {
  updatedAt: string;
}

function toSettings(raw: RawSettings): AdminSettings {
  return { ...raw, updatedAt: new Date(raw.updatedAt) };
}

export async function getSettings(): Promise<AdminSettings> {
  const raw = await apiFetch<RawSettings>("/settings", { auth: true });
  return toSettings(raw);
}

export async function updateSettings(input: AdminSettingsInput): Promise<AdminSettings> {
  const raw = await apiFetch<RawSettings>("/settings", {
    method: "PUT",
    auth: true,
    body: input,
  });
  return toSettings(raw);
}
