/**
 * Auth API methods
 * 
 * Provides typed operations for authentication-related endpoints.
 */

import { apiPost, type ApiResponse } from "./index";

/** User registration payload */
export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

/** Password reset request payload */
export interface ForgotPasswordPayload {
  email: string;
}

/** Password reset confirmation payload */
export interface ResetPasswordPayload {
  token: string;
  password: string;
}

/** Email verification payload */
export interface VerifyEmailPayload {
  token: string;
}

/** Resend verification email payload */
export interface ResendVerificationPayload {
  email?: string;
}

/** Accept invite payload */
export interface AcceptInvitePayload {
  token: string;
  password: string;
  name?: string;
}

/**
 * Register a new user account
 */
export async function registerUser(
  payload: RegisterPayload
): Promise<ApiResponse<{ ok: boolean }>> {
  return apiPost<{ ok: boolean }>("/api/auth/register", payload);
}

/**
 * Request a password reset email
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ApiResponse<{ success: true }>> {
  return apiPost<{ success: true }>("/api/auth/forgot-password", payload);
}

/**
 * Reset password with token
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ApiResponse<{ success: true }>> {
  return apiPost<{ success: true }>("/api/auth/reset-password", payload);
}

/**
 * Verify email address with token
 */
export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<ApiResponse<unknown>> {
  return apiPost<unknown>("/api/auth/verify", payload);
}

/**
 * Resend verification email
 */
export async function resendVerification(
  payload?: ResendVerificationPayload
): Promise<ApiResponse<unknown>> {
  return apiPost<unknown>("/api/auth/resend-verification", payload ?? {});
}

/**
 * Accept an invitation with token
 */
export async function acceptInvite(
  payload: AcceptInvitePayload
): Promise<ApiResponse<unknown>> {
  return apiPost<unknown>("/api/auth/accept-invite", payload);
}
