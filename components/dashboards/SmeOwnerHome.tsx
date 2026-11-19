"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart, Package, TrendingUp, Users,
  Truck, BarChart2, Activity, Settings,
} from "lucide-react";
import ModuleCard from "@/components/ModuleCard";
import StatTile from "@/components/StatTile";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";

const MODULES = [
  { id: "sales",        label: "Sales",        sub: "POS & transactions",  icon: ShoppingCart, bg: "#166534", href: "/sales" },
  { id: "stock",        label: "Stock",        sub: "Products & inventory", icon: Package,      bg: "#166534", href: "/stock" },
  { id: "finance",      label: "Finance",      sub: "Expenses & invoices",  icon: TrendingUp,   bg: "#166534", href: "/finance" },
  { id: "customers",    label: "Customers",    sub: "CRM & credit",         icon: Users,        bg: "#166534", href: "/customers" },
  { id: "suppliers",    label: "Suppliers",    sub: "Procurement",          icon: Truck,        bg: "#166534", href: "/suppliers" },
  { id: "reports",      label: "Reports",      sub: "Analytics & exports",  icon: BarChart2,    bg: "#166534", href: "/reports" },
  { id: "health-score", label: "Health Score", sub: "Business vitals",      icon: Activity,     bg: "#166534", href: "/health-score" },
  { id: "settings",     label: "Settings",     sub: "Account & business",   icon: Settings,     bg: "#166534", href: "/settings" },
];

export default function SmeOwnerHome() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ revenue: "RF 0", sales: 0, stock: 0, score: "—" });
  const sb = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const today = new Date().toISOString().slice(0, 10);
      const [salesRes, stockRes] = await Promise.all([
        sb.from("sales").select("total_amount").eq("owner_id", user.id).gte("created_at", today).eq("is_voided", false),
        sb.from("stock_items").select("id", { count: "exact" }).eq("owner_id", user.id).eq("is_active", true),
      ]);
      const total = (salesRes.data ?? []).reduce((s, r) => s + (r.total_amount ?? 0), 0);
      setStats({
        revenue: `RF ${total.toLocaleString()}`,
        sales:   salesRes.data?.length ?? 0,
        stock:   stockRes.count ?? 0,
        score:   "—",
      });
    }
    load();
  }, [user]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Revenue Today" value={stats.revenue} color="#2563EB" bg="#EFF6FF" />
        <StatTile label="Sales Today"   value={stats.sales}   color="#16A34A" bg="#F0FDF4" />
        <StatTile label="Stock Items"   value={stats.stock}   color="#EA580C" bg="#FFF7ED" />
        <StatTile label="Health Score"  value={stats.score}   color="#0F766E" bg="#F0FDFA" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {MODULES.map((m) => (
          <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
        ))}
      </div>
    </div>
  );
}
