"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, FolderOpen, Network } from "lucide-react";
import { useMe } from "@/features/auth/hooks/useAuth";

const NAV_ITEMS = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/projects", label: "Projects", icon: FolderOpen },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useMe();
  

  return (
    <nav className="flex h-full w-72 flex-shrink-0 flex-col border-r border-outline-variant bg-surface">
      <div className="flex items-center gap-4 px-6 py-8">
        <div className="flex h-10 w-10 items-center justify-center rounded border border-outline-variant bg-surface-container-high text-on-surface">
          <Network size={20} />
        </div>
        <h1 className="text-headline-md font-display font-bold tracking-tight text-on-surface">
          GitFlow
        </h1>
      </div>

      <div className="mt-4 flex flex-grow flex-col gap-2 px-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded px-4 py-3 text-[15px] transition-colors ${
                active
                  ? "border border-outline-variant bg-surface-container-highest font-semibold text-on-surface"
                  : "font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
              }`}
            >
              <Icon size={22} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-6">
        <button
          type="button"
          
          className="flex w-full items-center gap-3 rounded border border-outline-variant bg-surface-container-highest p-3 text-left transition-colors hover:bg-surface-bright"
        >
          <div className="h-10 w-10 flex-shrink-0 rounded border border-outline-variant bg-surface-container-high" />
          <div className="flex flex-col overflow-hidden">
            <span className="truncate text-body-md font-semibold text-on-surface">
              {user?.name ?? "..."}
            </span>
            <span className="truncate text-label-sm text-on-surface-variant">
              {user?.email ?? ""}
            </span>
          </div>
        </button>
      </div>
    </nav>
  );
}