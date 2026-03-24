/**
 * API module exports
 * 
 * Import from `@/lib/api` to access all API methods:
 * 
 * ```ts
 * import { getInstances, createInstance, apiRequest } from "@/lib/api";
 * ```
 */

// ═══════════════════════════════════════════════════════════════════════════════
// Core API utilities
// ═══════════════════════════════════════════════════════════════════════════════

import { getSession } from "next-auth/react";

/** Standard API response wrapper */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

/** HTTP methods supported by apiRequest */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/** Options for apiRequest */
export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** Skip auth header injection */
  skipAuth?: boolean;
  /** Custom base URL (defaults to empty string for same-origin) */
  baseUrl?: string;
}

/** Custom API error class with status code */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** Check if error is an authentication error (401) */
  get isAuthError(): boolean {
    return this.status === 401;
  }

  /** Check if error is a rate limit error (429) */
  get isRateLimitError(): boolean {
    return this.status === 429;
  }

  /** Check if error is a not found error (404) */
  get isNotFoundError(): boolean {
    return this.status === 404;
  }

  /** Check if error is a validation error (400) */
  get isValidationError(): boolean {
    return this.status === 400;
  }

  /** Check if error is a server error (5xx) */
  get isServerError(): boolean {
    return this.status >= 500 && this.status < 600;
  }

  /** Check if error is a forbidden error (403) */
  get isForbiddenError(): boolean {
    return this.status === 403;
  }
}

/**
 * Get the auth token from the current session
 * Uses NextAuth's getSession for client-side auth
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const session = await getSession();
    // NextAuth doesn't expose the raw token directly in session
    // The cookie is automatically sent with fetch requests to same-origin
    // For cross-origin or specific token needs, this can be extended
    return session?.user ? "authenticated" : null;
  } catch {
    return null;
  }
}

/**
 * Standardized API request function with consistent error handling
 * 
 * @param endpoint - API endpoint path (e.g., "/api/instances")
 * @param options - Request options
 * @returns Promise resolving to ApiResponse<T>
 * @throws ApiError on HTTP errors
 * 
 * @example
 * const response = await apiRequest<Instance[]>('/api/instances');
 * if (response.error) { handleError(response.error); }
 * else { useData(response.data); }
 */
export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    body,
    headers: customHeaders = {},
    skipAuth = false,
    baseUrl = "",
  } = options;

  // Build headers
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...customHeaders,
  };

  // Add auth header if not skipped
  if (!skipAuth) {
    const token = await getAuthToken();
    if (token && token !== "authenticated") {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  // Add content-type for methods with body
  if (body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // Build request URL
  const url = endpoint.startsWith("http") 
    ? endpoint 
    : `${baseUrl}${endpoint}`;

  // Build fetch options
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "same-origin", // Include cookies for NextAuth session
  };

  if (body !== undefined) {
    fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, fetchOptions);
    const status = response.status;

    // Handle specific status codes
    if (status === 401) {
      // Redirect to sign-in on auth errors
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        window.location.href = `/sign-in?callbackUrl=${encodeURIComponent(currentPath)}`;
      }
      return { error: "Unauthorized", status: 401 };
    }

    if (status === 429) {
      const errorData = await parseResponseBody(response);
      const message = extractErrorMessage(errorData) || "Rate limit exceeded. Please try again later.";
      return { error: message, status: 429 };
    }

    // Parse response body
    const data = await parseResponseBody(response);

    // Handle error responses
    if (!response.ok) {
      const message = extractErrorMessage(data) || `HTTP ${status} error`;
      return { error: message, status };
    }

    // Return successful response
    return { data: data as T, status };
  } catch (error) {
    // Network or parsing errors
    const message = error instanceof Error ? error.message : "Network error";
    return { error: message, status: 0 };
  }
}

/**
 * Parse response body as JSON or text
 */
async function parseResponseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  
  const text = await response.text();
  // Try to parse as JSON even if content-type didn't indicate it
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * Extract error message from response data
 */
function extractErrorMessage(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (data === null || data === undefined) return null;
  
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (typeof obj.error === "string") return obj.error;
    if (typeof obj.message === "string") return obj.message;
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      return String(obj.errors[0]);
    }
  }
  
  return null;
}

// Convenience methods for common HTTP verbs

/** GET request shortcut */
export function apiGet<T>(endpoint: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
  return apiRequest<T>(endpoint, { ...options, method: "GET" });
}

/** POST request shortcut */
export function apiPost<T>(endpoint: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
  return apiRequest<T>(endpoint, { ...options, method: "POST", body });
}

/** PUT request shortcut */
export function apiPut<T>(endpoint: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
  return apiRequest<T>(endpoint, { ...options, method: "PUT", body });
}

/** PATCH request shortcut */
export function apiPatch<T>(endpoint: string, body: unknown, options?: Omit<ApiRequestOptions, "method" | "body">) {
  return apiRequest<T>(endpoint, { ...options, method: "PATCH", body });
}

/** DELETE request shortcut */
export function apiDelete<T>(endpoint: string, options?: Omit<ApiRequestOptions, "method">) {
  return apiRequest<T>(endpoint, { ...options, method: "DELETE" });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Domain-specific API methods
// ═══════════════════════════════════════════════════════════════════════════════

export * from "./instances";
export * from "./auth";
export * from "./billing";
export * from "./messages";
export * from "./user";
