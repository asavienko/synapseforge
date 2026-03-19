/**
 * SSH-based config sync utility.
 *
 * Pushes the latest openclaw.json to the VPS immediately via SSH,
 * then restarts the openclaw Docker service.
 *
 * Uses the OS `ssh` binary via child_process — no external SSH library needed.
 */

import { exec as execCb } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { randomBytes } from "crypto";

const execAsync = promisify(execCb);

/**
 * Extract the IP/hostname from a VPS URL.
 * e.g. "http://1.2.3.4:18789" → "1.2.3.4"
 *      "https://my-vps.example.com" → "my-vps.example.com"
 */
export function extractVpsHost(vpsUrl: string): string {
  try {
    const url = new URL(vpsUrl);
    return url.hostname;
  } catch {
    // fallback: strip protocol and port manually
    return vpsUrl.replace(/^https?:\/\//, "").split(":")[0].split("/")[0];
  }
}

export interface SshSyncOptions {
  /** Decrypted ED25519 private key PEM content */
  privateKey: string;
  /** VPS URL (http://1.2.3.4:18789 or similar) */
  vpsUrl: string;
  /** The gateway token for authenticating against the config endpoint */
  gatewayToken: string;
  /** The SynapseForge app URL (for pulling updated config) */
  appUrl: string;
  /** The instance ID */
  instanceId: string;
}

export interface SshSyncResult {
  success: boolean;
  error?: string;
}

export async function sshSyncConfig(opts: SshSyncOptions): Promise<SshSyncResult> {
  const { privateKey, vpsUrl, gatewayToken, appUrl, instanceId } = opts;

  // Write private key to a temp file
  const keyFile = join(tmpdir(), `sf-ssh-${randomBytes(8).toString("hex")}.pem`);
  try {
    await writeFile(keyFile, privateKey, { mode: 0o600 });
  } catch (err) {
    return { success: false, error: `Failed to write SSH key: ${err instanceof Error ? err.message : String(err)}` };
  }

  const host = extractVpsHost(vpsUrl);

  // Command to run on the remote server:
  // 1. Pull latest config from the SynapseForge API
  // 2. Atomically replace openclaw.json
  // 3. Restart the openclaw Docker container
  const remoteCmd = [
    `curl -sf -H "Authorization: Bearer ${gatewayToken}" "${appUrl}/api/internal/instance-config/${instanceId}" -o /opt/openclaw/openclaw.json.new`,
    `mv /opt/openclaw/openclaw.json.new /opt/openclaw/openclaw.json`,
    `docker compose -f /opt/openclaw/docker-compose.yml restart openclaw`,
  ].join(" && ");

  const sshCmd = `ssh -i ${keyFile} -o StrictHostKeyChecking=no -o ConnectTimeout=15 root@${host} ${JSON.stringify(remoteCmd)}`;

  try {
    await execAsync(sshCmd, { timeout: 60_000 });
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `SSH sync failed: ${message}` };
  } finally {
    // Always clean up the key file
    unlink(keyFile).catch(() => {});
  }
}
