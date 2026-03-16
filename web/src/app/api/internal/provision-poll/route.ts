import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Shared secret for internal endpoints
const INTERNAL_SECRET = process.env.INTERNAL_API_KEY;

export async function POST(req: NextRequest) {
  // Auth via shared secret header
  const authHeader = req.headers.get("x-internal-api-key");
  if (!INTERNAL_SECRET || authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find all instances in 'provisioning' state with a VPS server ID
    const instances = await prisma.aIInstance.findMany({
      where: {
        provisionStatus: "provisioning",
        vpsServerId: { not: null },
        vpsProvider: "hetzner",
      },
      select: {
        id: true,
        vpsServerId: true,
        userId: true,
      },
    });

    const results: Array<{ instanceId: string; status: string; error?: string }> = [];

    for (const instance of instances) {
      try {
        // Check Hetzner server status with timeout
        const hetznerRes = await fetch(
          `https://api.hetzner.cloud/v1/servers/${instance.vpsServerId}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.HETZNER_API_KEY}`,
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
          }
        );

        if (!hetznerRes.ok) {
          results.push({ instanceId: instance.id, status: "failed", error: "Hetzner API error" });
          await prisma.aIInstance.update({
            where: { id: instance.id },
            data: { provisionStatus: "failed" },
          });
          continue;
        }

        const data = await hetznerRes.json();
        const server = data.server;

        if (server.status === "running") {
          // Server is ready, now check if OpenClaw gateway is healthy
          const ip = server.public_net.ipv4.ip;
          const gatewayUrl = `http://${ip}:3000`;
          
          try {
            const healthRes = await fetch(`${gatewayUrl}/health`, { 
              signal: AbortSignal.timeout(5000) 
            });
            if (healthRes.ok) {
              // Gateway is healthy, mark ready
              await prisma.aIInstance.update({
                where: { id: instance.id },
                data: {
                  provisionStatus: "ready",
                  vpsUrl: gatewayUrl,
                  status: "running",
                  configSynced: true,
                },
              });
              results.push({ instanceId: instance.id, status: "ready" });
            } else {
              // Server running but gateway not healthy yet
              results.push({ instanceId: instance.id, status: "provisioning" });
            }
          } catch {
            // Gateway not yet responding
            results.push({ instanceId: instance.id, status: "provisioning" });
          }
        } else if (server.status === "error" || server.status === "off") {
          // Server failed to provision
          await prisma.aIInstance.update({
            where: { id: instance.id },
            data: { provisionStatus: "failed" },
          });
          results.push({ instanceId: instance.id, status: "failed", error: `Server status: ${server.status}` });
        } else {
          // Still provisioning, no change
          results.push({ instanceId: instance.id, status: "provisioning" });
        }
      } catch (err) {
        results.push({ instanceId: instance.id, status: "failed", error: err instanceof Error ? err.message : "Unknown error" });
        await prisma.aIInstance.update({
          where: { id: instance.id },
          data: { provisionStatus: "failed" },
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      ok: true,
      checked: instances.length,
      results,
    });
  } catch (error) {
    console.error("Provision poll error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}