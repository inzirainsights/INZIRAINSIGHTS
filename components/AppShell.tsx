"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/roles";
import Header from "./Header";

export default function AppShell({
  children,
  path,
}: {
  children: React.ReactNode;
  path?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (path && !canAccess(user.role, path)) {
      router.replace("/");
    }
  }, [user, loading, path, router]);

  // Also block redirect while there's an active Supabase session but profile hasn't loaded yet
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0FDF4]">
        <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  if (path && !canAccess(user.role, path)) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg, #F0FDF4)" }}>
      <Header />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-5">
        {children}
      </main>
      <footer className="text-center py-2 text-[11px] text-gray-400">
        Built by <span className="font-bold text-green-600">OrynTech Ltd</span>
      </footer>
    </div>
  );
}
