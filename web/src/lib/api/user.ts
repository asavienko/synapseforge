/**
 * User API methods
 * 
 * Provides typed operations for user profile management.
 */

import { apiGet, apiPatch, type ApiResponse } from "./index";

/** User profile data */
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
  plan: string;
  createdAt: string;
  updatedAt: string;
}

/** Update profile payload */
export interface UpdateProfilePayload {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

/** Update profile response */
export interface UpdateProfileResponse {
  success: boolean;
  user?: User;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  return apiGet<User>("/api/user/me");
}

/**
 * Update user profile
 */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<UpdateProfileResponse>> {
  return apiPatch<UpdateProfileResponse>("/api/user", payload);
}
