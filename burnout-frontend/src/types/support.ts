import { User } from "@/types/auth";
import { Alert } from "@/types/counselor";

export type SupportStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';
export type SenderType = 'STUDENT' | 'COUNSELOR' | 'SYSTEM';

export interface SupportSession {
  id: string;
  student: User;
  counselor?: User;
  alert: Alert;
  status: SupportStatus;
  isAnonymous: boolean;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: SenderType;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}
