"use client";
import { useRouter } from "next/navigation";
import { ShoppingCart, ClipboardList } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const MODULES = [
  { id: "sales",   label: "New Sale", sub: "Record a transaction", icon: ShoppingCart, bg: "#166534", href: "/sales" },
  { id: "history", label: "History",  sub: "Today's sales",        icon: ClipboardList, bg: "#166534", href: "/sales/history" },
];

export default function CashierHome() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 gap-4">
      {MODULES.map((m) => (
        <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
      ))}
    </div>
  );
}
