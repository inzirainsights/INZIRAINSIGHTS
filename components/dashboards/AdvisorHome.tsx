"use client";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Building2, Settings } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const MODULES = [
  { id: "dashboard",  label: "Dashboard",     sub: "Advisory overview", icon: LayoutDashboard, bg: "#166534", href: "/advisor" },
  { id: "directory",  label: "SME Directory", sub: "Browse businesses", icon: Building2,       bg: "#166534", href: "/advisor/directory" },
  { id: "settings",   label: "Settings",      sub: "",                  icon: Settings,        bg: "#166534", href: "/settings" },
];

export default function AdvisorHome() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {MODULES.map((m) => (
        <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
      ))}
    </div>
  );
}
