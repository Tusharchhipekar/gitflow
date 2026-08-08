import { AuthGuard } from "@/shared/components/AuthGuard";
import { Sidebar } from "@/shared/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="relative z-0 flex-1 overflow-y-auto bg-surface">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}