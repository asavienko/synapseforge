import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { EmailVerifyBanner } from "@/components/EmailVerifyBanner";
import { VerifiedSuccessBanner } from "@/components/VerifiedSuccessBanner";
import { UsageWarningBanner } from "@/components/UsageWarningBanner";
import { NotificationPoller } from "./NotificationPoller";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/${locale}/sign-in`);

  const user = await prisma.user.findUnique({ where: { id: session.user.id! } });
  if (user && !user.onboardingDone) redirect(`/${locale}/onboarding`);
  // Email verification is encouraged but NOT required to use the app
  const needsVerification = user && !user.emailVerified;

  // Determine elevated roles so sidebar can show the right links
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(session.user.email ?? "");
  const managerRecord = await prisma.manager.findUnique({ where: { email: session.user.email ?? "" } });
  const isManager = !!managerRecord;

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {needsVerification && <EmailVerifyBanner />}
      <Suspense fallback={null}>
        <VerifiedSuccessBanner />
      </Suspense>
      <div className="flex flex-1">
        <DashboardSidebar
          userName={session.user.name}
          userEmail={session.user.email}
          isAdmin={isAdmin}
          isManager={isManager}
        />
        {/* pt-14 on mobile to offset the fixed top bar */}
        <main className="flex-1 overflow-auto pt-14 md:pt-0">
          <NotificationPoller />
          <UsageWarningBanner />
          {children}
        </main>
      </div>
    </div>
  );
}
