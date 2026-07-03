import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactMessage, MessageStatus } from "@/types/message";

const MESSAGES_COLLECTION = "messages";

function toDate(value: unknown): Date {
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

const messageConverter: FirestoreDataConverter<ContactMessage> = {
  toFirestore(message: ContactMessage): DocumentData {
    const { id: _id, ...rest } = message;
    void _id;
    return rest;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions,
  ): ContactMessage {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      name: typeof data.name === "string" ? data.name : "",
      email: typeof data.email === "string" ? data.email : "",
      message: typeof data.message === "string" ? data.message : "",
      status: (data.status as MessageStatus) ?? "unread",
      createdAt: toDate(data.createdAt),
    };
  },
};

const messagesRef = collection(db, MESSAGES_COLLECTION).withConverter(
  messageConverter,
);

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

/** Public write used by the homepage contact form. */
export async function submitMessage(input: ContactMessageInput): Promise<void> {
  await addDoc(collection(db, MESSAGES_COLLECTION), {
    ...input,
    status: "unread",
    createdAt: serverTimestamp(),
  });
}

export function subscribeToMessages(
  onData: (messages: ContactMessage[]) => void,
  onError: (error: Error) => void,
): () => void {
  const messagesQuery = query(messagesRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    messagesQuery,
    (snapshot) => onData(snapshot.docs.map((docSnapshot) => docSnapshot.data())),
    (error) => onError(error),
  );
}

export async function updateMessageStatus(
  id: string,
  status: MessageStatus,
): Promise<void> {
  await updateDoc(doc(db, MESSAGES_COLLECTION, id), { status });
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
}
