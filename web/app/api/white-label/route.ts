import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const DEFAULTS = {
  brandName: "OpenHelix AI",
  brandColor: "#7c3aed",
  logoUrl: null as string | null,
  customDomain: null as string | null,
  hidePoweredBy: false,
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const config = await prisma.whiteLabelConfig.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(config ?? { ...DEFAULTS, userId: session.user.id });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { brandName, brandColor, logoUrl, customDomain, hidePoweredBy } = body;

  const data: Record<string, unknown> = {};
  if (brandName !== undefined) data.brandName = String(brandName).trim() || "OpenHelix AI";
  if (brandColor !== undefined) data.brandColor = String(brandColor);
  if (logoUrl !== undefined) data.logoUrl = logoUrl ? String(logoUrl) : null;
  if (customDomain !== undefined) data.customDomain = customDomain ? String(customDomain) : null;
  if (hidePoweredBy !== undefined) data.hidePoweredBy = Boolean(hidePoweredBy);

  const config = await prisma.whiteLabelConfig.upsert({
    where: { userId: session.user.id },
    update: data,
    create: {
      userId: session.user.id,
      brandName: (data.brandName as string) ?? DEFAULTS.brandName,
      brandColor: (data.brandColor as string) ?? DEFAULTS.brandColor,
      logoUrl: (data.logoUrl as string | null) ?? null,
      customDomain: (data.customDomain as string | null) ?? null,
      hidePoweredBy: (data.hidePoweredBy as boolean) ?? false,
    },
  });

  return NextResponse.json(config);
}
