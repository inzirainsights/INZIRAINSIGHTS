"use client";
import { useRouter } from "next/navigation";
import { ShoppingCart, Package, BarChart2, UserCheck } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const MODULES = [
  { id: "sales",   label: "Sales",   sub: "POS & transactions",  icon: ShoppingCart, bg: "#166534", href: "/sales" },
  { id: "stock",   label: "Stock",   sub: "Products & inventory", icon: Package,      bg: "#166534", href: "/stock" },
  { id: "reports", label: "Reports", sub: "Analytics",            icon: BarChart2,    bg: "#166534", href: "/reports" },
  { id: "workers", label: "Workers", sub: "Team performance",     icon: UserCheck,    bg: "#166534", href: "/settings" },
];

export default function ManagerHome() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {MODULES.map((m) => (
        <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
      ))}
    </div>
  );
}
