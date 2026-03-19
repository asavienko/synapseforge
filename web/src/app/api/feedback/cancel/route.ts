import { auth } from "@/lib/auth";
import { email } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { reason, feedback } = (await req.json()) as {
    reason: string;
    feedback?: string;
  };

  // Send notification email (ActivityLog requires instanceId so we use email instead)
  await email
    .newSignupAlert(
      ["hello@openhelixai.com"],
      `Cancellation feedback from ${session.user.name ?? session.user.email}`,
      `${session.user.email ?? ""} | Reason: ${reason}${feedback ? ` | Feedback: ${feedback}` : ""}`
    )
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
