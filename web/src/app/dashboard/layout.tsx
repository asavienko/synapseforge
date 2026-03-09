import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      <DashboardSidebar userName={session.user.name} userEmail={session.user.email} />
      {/* pt-14 on mobile to offset the fixed top bar */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
    </div>
  );
}
