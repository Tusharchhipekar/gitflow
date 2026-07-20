import { Sidebar } from "@/shared/components/Sidebar";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="relative z-0 flex-1 overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}