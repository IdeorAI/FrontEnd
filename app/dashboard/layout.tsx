// app/dashboard/layout.tsx
import { AppSidebar } from "@/components/app-sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1 lg:ml-64">
        <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
