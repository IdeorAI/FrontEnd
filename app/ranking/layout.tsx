import { MainLayout } from "@/components/main-layout"
import { getAuthUser } from "@/lib/auth/get-auth-user"

export default async function RankingLayout({ children }: { children: React.ReactNode }) {
  const { userProps } = await getAuthUser()
  return <MainLayout user={userProps}>{children}</MainLayout>
}
