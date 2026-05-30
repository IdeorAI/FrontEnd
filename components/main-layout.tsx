import { AppSidebar } from "@/components/app-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar user={user} />
      <div className="flex-1 lg:ml-64 min-w-0">
        <div className="h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
        <main className="pt-16 px-4 pb-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
