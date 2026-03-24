/**
 * Billing API methods
 * 
 * Provides typed operations for billing and checkout.
 */

import { apiGet, apiPost, type ApiResponse } from "./index";
import type { PlanKey } from "@/lib/stripe";

/** Checkout session response */
export interface CheckoutResponse {
  url?: string;
  stripeUnavailable?: boolean;
  managedPlanContact?: boolean;
  message?: string;
  success?: boolean;
  downgradedToFree?: boolean;
}

/** Checkout request payload */
export interface CheckoutPayload {
  plan: PlanKey;
}

/** Portal session response */
export interface PortalResponse {
  url?: string;
  error?: string;
}

/** Subscription info */
export interface SubscriptionInfo {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

/**
 * Create a Stripe checkout session for plan subscription
 */
export async function createCheckout(
  payload: CheckoutPayload
): Promise<ApiResponse<CheckoutResponse>> {
  return apiPost<CheckoutResponse>("/api/billing/checkout", payload);
}

/**
 * Create a Stripe customer portal session
 */
export async function createPortalSession(): Promise<ApiResponse<PortalResponse>> {
  return apiPost<PortalResponse>("/api/billing/portal", {});
}
