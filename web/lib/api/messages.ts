/**
 * Messages API methods
 * 
 * Provides typed operations for messaging between users and managers.
 */

import { apiGet, apiPost, type ApiResponse } from "./index";

/** Message data structure */
export interface Message {
  id: string;
  body: string;
  senderType: "user" | "manager";
  userId: string;
  managerId?: string;
  createdAt: string;
  updatedAt: string;
  read: boolean;
}

/** Messages list response */
export interface MessagesResponse {
  messages: Message[];
  calLink?: string | null;
  noManager?: boolean;
}

/** Send message payload */
export interface SendMessagePayload {
  body: string;
}

/** Admin/Manager send message query params */
export interface SendMessageAsManagerParams {
  asManager: true;
  userId: string;
}

/**
 * Fetch messages for the current user
 * Admin/manager can pass userId to fetch messages for a specific user
 */
export async function getMessages(userId?: string): Promise<ApiResponse<MessagesResponse>> {
  const endpoint = userId ? `/api/messages?userId=${encodeURIComponent(userId)}` : "/api/messages";
  return apiGet<MessagesResponse>(endpoint);
}

/**
 * Send a message to the assigned manager
 */
export async function sendMessage(
  payload: SendMessagePayload
): Promise<ApiResponse<Message>> {
  return apiPost<Message>("/api/messages", payload);
}

/**
 * Send a message as a manager/admin to a user
 * Requires admin privileges or manager assignment
 */
export async function sendMessageAsManager(
  userId: string,
  payload: SendMessagePayload
): Promise<ApiResponse<Message>> {
  return apiPost<Message>(`/api/messages?asManager=true&userId=${encodeURIComponent(userId)}`, payload);
}

/**
 * Mark all messages as read
 */
export async function markAllMessagesRead(): Promise<ApiResponse<unknown>> {
  return apiPost<unknown>("/api/messages/read-all", {});
}

/**
 * Get unread message count
 */
export async function getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
  return apiGet<{ count: number }>("/api/messages/unread");
}
