import { MainLayout } from "@/components/main-layout";
import { getAuthUser } from "@/lib/auth/get-auth-user";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProps } = await getAuthUser();
  return <MainLayout user={userProps}>{children}</MainLayout>;
}
