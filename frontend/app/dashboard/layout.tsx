"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

const sidebarLinks: SidebarLink[] = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: "💼" },
  { href: "/dashboard/trades", label: "Trades", icon: "📈" },
  { href: "/dashboard/insights", label: "Insights", icon: "🤖" },
  { href: "/dashboard/payments", label: "Payments", icon: "💰" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, logout } = useAuthStore((state) => ({
    user: state.user,
    token: state.token,
    logout: state.logout,
  }));

  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !token) {
      router.push("/auth/login");
    }
  }, [mounted, token, router]);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  if (!mounted || !token) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-card border-r transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="text-2xl font-bold">
            {sidebarOpen ? "COD" : "C"}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-4 px-4 py-3 hover:bg-background transition-colors"
              title={!sidebarOpen ? link.label : ""}
            >
              <span className="text-xl">{link.icon}</span>
              {sidebarOpen && <span className="text-sm">{link.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full p-2 hover:bg-background rounded transition-colors"
            title="Toggle sidebar"
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">COD - Crypto Operating Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email || "User"}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm border rounded hover:bg-background transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
