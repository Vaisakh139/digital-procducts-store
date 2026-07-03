import { doc, onSnapshot, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DEFAULT_BUSINESS_SETTINGS, type BusinessSettings } from "@/types/settings";

const SETTINGS_DOC_PATH = "settings/business";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

function parseSettings(
  data: Record<string, unknown> | undefined,
): BusinessSettings {
  if (!data) return DEFAULT_BUSINESS_SETTINGS;

  const social = (data.socialLinks ?? {}) as Record<string, unknown>;

  return {
    businessName:
      typeof data.businessName === "string"
        ? data.businessName
        : DEFAULT_BUSINESS_SETTINGS.businessName,
    supportEmail:
      typeof data.supportEmail === "string"
        ? data.supportEmail
        : DEFAULT_BUSINESS_SETTINGS.supportEmail,
    logoUrl: typeof data.logoUrl === "string" ? data.logoUrl : null,
    socialLinks: {
      twitter: typeof social.twitter === "string" ? social.twitter : "",
      facebook: typeof social.facebook === "string" ? social.facebook : "",
      instagram: typeof social.instagram === "string" ? social.instagram : "",
      linkedin: typeof social.linkedin === "string" ? social.linkedin : "",
      github: typeof social.github === "string" ? social.github : "",
    },
    updatedAt: toDate(data.updatedAt),
  };
}

export function subscribeToSettings(
  onData: (settings: BusinessSettings) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    doc(db, SETTINGS_DOC_PATH),
    (snapshot) => onData(parseSettings(snapshot.data())),
    (error) => onError(error),
  );
}

export async function updateSettings(
  input: Omit<BusinessSettings, "updatedAt">,
): Promise<void> {
  await setDoc(
    doc(db, SETTINGS_DOC_PATH),
    { ...input, updatedAt: serverTimestamp() },
    { merge: true },
  );
}
