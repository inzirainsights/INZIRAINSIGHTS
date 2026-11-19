"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, Building2, Landmark, Settings } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";
import StatTile from "@/components/StatTile";
import { createClient } from "@/lib/supabase/client";

const C = "#166534";

const MODULES = [
  { id: "admin",    label: "Platform",  sub: "Overview & stats", icon: LayoutDashboard, bg: C, href: "/admin" },
  { id: "smes",     label: "SMEs",      sub: "All businesses",   icon: Building2,       bg: C, href: "/admin/smes" },
  { id: "lenders",  label: "Lenders",   sub: "Partner banks",    icon: Landmark,        bg: C, href: "/admin/lenders" },
  { id: "settings", label: "Settings",  sub: "System config",    icon: Settings,        bg: C, href: "/settings" },
];

export default function PulseAdminHome() {
  const router = useRouter();
  const [stats, setStats] = useState({ smes: 0, lenders: 0, scored: 0, at_risk: 0 });

  useEffect(() => {
    const sb = createClient();
    async function load() {
      const [smesRes, lendersRes] = await Promise.all([
        sb.from("users").select("id", { count: "exact" }).eq("role", "sme_owner"),
        sb.from("users").select("id", { count: "exact" }).eq("role", "lender"),
      ]);
      setStats(s => ({ ...s, smes: smesRes.count ?? 0, lenders: lendersRes.count ?? 0 }));
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Total SMEs"  value={stats.smes}    color="#166534" bg="#F0FDF4" />
        <StatTile label="Lenders"     value={stats.lenders} color="#166534" bg="#F0FDF4" />
        <StatTile label="Scored SMEs" value={stats.scored}  color="#166534" bg="#F0FDF4" />
        <StatTile label="At Risk"     value={stats.at_risk} color="#DC2626" bg="#FEF2F2" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {MODULES.map((m) => (
          <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
        ))}
      </div>
    </div>
  );
}
