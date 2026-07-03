import {
  browserLocalPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AdminProfile } from "@/types/admin";

const ADMINS_COLLECTION = "admins";

export async function loginWithEmail(
  email: string,
  password: string,
  remember: boolean,
): Promise<User> {
  await setPersistence(
    auth,
    remember ? browserLocalPersistence : browserSessionPersistence,
  );
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Looks up the admins/{uid} Firestore document for a signed-in user. Returns
 * null if no such document exists or its role isn't "admin" — callers should
 * treat that as "not authorized" and sign the user out.
 */
export async function fetchAdminProfile(
  uid: string,
): Promise<AdminProfile | null> {
  const snapshot = await getDoc(doc(db, ADMINS_COLLECTION, uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  if (data.role !== "admin") return null;

  return {
    uid,
    email: typeof data.email === "string" ? data.email : "",
    name: typeof data.name === "string" ? data.name : "Admin",
    role: "admin",
    avatarUrl: typeof data.avatarUrl === "string" ? data.avatarUrl : null,
  };
}

export function onAuthChange(
  callback: (user: User | null) => void,
): () => void {
  return onAuthStateChanged(auth, callback);
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? "";

  switch (code) {
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
