/**
 * Instance API methods
 * 
 * Provides typed CRUD operations for AI instance management.
 */

import { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from "./index";

/** AI Instance data structure */
export interface Instance {
  id: string;
  name: string;
  type: string;
  status: "running" | "stopped" | "error";
  tier: string;
  description?: string;
  config?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  healthStatus?: string;
  lastCheckedAt?: string;
  hasGateway?: boolean;
  vpsUrl?: string;
  autoUpdate?: boolean;
}

/** Instance creation payload */
export interface CreateInstancePayload {
  name: string;
  type?: string;
  description?: string;
  systemPrompt?: string;
  agentTemplateName?: string;
  agentTemplateId?: string;
  templateId?: string;
}

/** Instance update payload */
export interface UpdateInstancePayload {
  name?: string;
  description?: string;
  status?: "running" | "stopped";
  config?: string | Record<string, unknown>;
  autoUpdate?: boolean;
}

/** Instance with sensitive fields removed */
export interface SafeInstance extends Omit<Instance, "gatewayToken" | "vpsUrl" | "sshPrivateKey"> {
  hasGateway: boolean;
}

/**
 * Fetch all instances for the current user
 * Includes health status checks
 */
export async function getInstances(): Promise<ApiResponse<Instance[]>> {
  return apiGet<Instance[]>("/api/instances");
}

/**
 * Fetch a single instance by ID
 */
export async function getInstance(id: string): Promise<ApiResponse<SafeInstance>> {
  return apiGet<SafeInstance>(`/api/instances/${id}`);
}

/**
 * Create a new instance
 */
export async function createInstance(
  payload: CreateInstancePayload
): Promise<ApiResponse<Instance>> {
  return apiPost<Instance>("/api/instances", payload);
}

/**
 * Update an existing instance
 */
export async function updateInstance(
  id: string,
  payload: UpdateInstancePayload
): Promise<ApiResponse<SafeInstance>> {
  return apiPatch<SafeInstance>(`/api/instances/${id}`, payload);
}

/**
 * Delete an instance
 */
export async function deleteInstance(
  id: string
): Promise<ApiResponse<{ ok: boolean; vpsNote?: string }>> {
  return apiDelete<{ ok: boolean; vpsNote?: string }>(`/api/instances/${id}`);
}

/**
 * Start an instance (update status to running)
 */
export async function startInstance(id: string): Promise<ApiResponse<SafeInstance>> {
  return updateInstance(id, { status: "running" });
}

/**
 * Stop an instance (update status to stopped)
 */
export async function stopInstance(id: string): Promise<ApiResponse<SafeInstance>> {
  return updateInstance(id, { status: "stopped" });
}
