"use client";
import { useRouter } from "next/navigation";
import { TrendingUp, BarChart2, BookOpen } from "lucide-react";
import ModuleCard from "@/components/ModuleCard";

const MODULES = [
  { id: "finance",  label: "Finance",  sub: "Expenses & invoices", icon: TrendingUp, bg: "#166534", href: "/finance" },
  { id: "reports",  label: "Reports",  sub: "Analytics & exports", icon: BarChart2,  bg: "#166534", href: "/reports" },
  { id: "books",    label: "Books",    sub: "Financial records",   icon: BookOpen,   bg: "#166534", href: "/finance/books" },
];

export default function AccountantHome() {
  const router = useRouter();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {MODULES.map((m) => (
        <ModuleCard key={m.id} label={m.label} sub={m.sub} icon={m.icon} bg={m.bg} onClick={() => router.push(m.href)} />
      ))}
    </div>
  );
}
