import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  // Validate code exists
  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral) {
    // Still redirect to sign-up, just without the ref param
    return NextResponse.redirect(new URL("/sign-up", req.url));
  }

  const signUpUrl = new URL("/sign-up", req.url);
  signUpUrl.searchParams.set("ref", code);

  const response = NextResponse.redirect(signUpUrl);

  // Set cookie: 30 days
  response.cookies.set("referral_code", code, {
    httpOnly: false, // needs to be readable by client form
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
