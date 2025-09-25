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

  type UserMetadata = { full_name?: string } & Record<string, unknown>;
  const meta = user.user_metadata as UserMetadata;

  const userProps = {
    name: meta.full_name ?? user.email ?? "User",
    email: user.email ?? "",
  };

  return (
    <div className="flex min-h-screen">
      <AppSidebar user={userProps} />
      <main className="flex-1 lg:ml-64 p-6">{children}</main>
    </div>
  );
}
