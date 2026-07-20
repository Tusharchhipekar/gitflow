import { Network } from "lucide-react";
import { AuthForm } from "@/features/auth/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant bg-surface-container-high text-on-surface">
          <Network size={20} />
        </div>
        <span className="text-headline-md font-display">GitFlow</span>
      </div>
      <AuthForm />
    </main>
  );
}