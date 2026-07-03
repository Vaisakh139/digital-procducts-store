export const MESSAGE_STATUSES = ["unread", "read", "replied"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  createdAt: Date;
}
