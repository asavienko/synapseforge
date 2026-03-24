import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;
  const version = await prisma.openClawVersion.findFirst({ where: { tag } });
  return NextResponse.json({ version });
}
