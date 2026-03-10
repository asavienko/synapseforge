import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { EmailVerifyBanner } from "@/components/EmailVerifyBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
  if (user && !user.onboardingDone) redirect("/onboarding");

  const needsVerification = user && !user.emailVerified;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {needsVerification && <EmailVerifyBanner />}
      <div className="flex flex-1">
        <DashboardSidebar userName={session.user.name} userEmail={session.user.email} />
        {/* pt-14 on mobile to offset the fixed top bar */}
        <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
      </div>
    </div>
  );
}
