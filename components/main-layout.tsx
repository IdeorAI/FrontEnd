import { AppSidebar } from "@/components/app-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <div className="flex-1 lg:ml-64">
        <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
