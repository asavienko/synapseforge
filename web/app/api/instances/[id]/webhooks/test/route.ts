import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/instances/[id]/webhooks/test - Test a webhook
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { url } = await req.json();

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true, name: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Send test payload to webhook
    const testPayload = {
      event: "test",
      instanceId: id,
      instanceName: instance.name,
      timestamp: new Date().toISOString(),
      message: "This is a test webhook from OpenHelix AI",
    };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-OpenHelix AI-Event": "test",
          "X-OpenHelix AI-Signature": "test-signature",
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: `Webhook returned ${response.status}` },
          { status: 400 }
        );
      }
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to reach webhook URL" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("[webhooks/test] Error:", error);
    return NextResponse.json(
      { error: "Failed to test webhook" },
      { status: 500 }
    );
  }
}
