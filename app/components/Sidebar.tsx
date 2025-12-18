"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/dashboards", label: "API Keys Dashboard" },
  { href: "/playground", label: "API Playground" },
];

interface CurrentUser {
  id: string;
  username: string;
  created_at: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Auto-hide sidebar when mouse is far from the left edge,
  // and reveal it when the mouse gets close to the edge.
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = event.clientX;

      // If mouse is very close to the left edge, show sidebar.
      if (x < 40) {
        setIsCollapsed(false);
        return;
      }

      // If mouse is far enough from the sidebar width, hide it.
      if (x > 260) {
        setIsCollapsed(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch current user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) {
          setCurrentUser(null);
          return;
        }
        const data = await res.json();
        setCurrentUser(data.user);
      } catch {
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };

    void loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setCurrentUser(null);
      router.push("/");
    }
  };

  const initials = currentUser
    ? currentUser.username
        .split(/[^\w]/)
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("") || "US"
    : "US";

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transform transition-transform duration-200 ${
        isCollapsed ? "-translate-x-full" : "translate-x-0"
      }`}
    >
      <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          API Management
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {isLoadingUser
                ? "Loading..."
                : currentUser?.username ?? "Guest"}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {currentUser
                ? "Signed in"
                : "Not signed in"}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}


