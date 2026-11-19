"use client";
import { useAuth } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin text-green-600" size={28} />
    </div>
  );
}

const SmeOwnerHome   = dynamic(() => import("@/components/dashboards/SmeOwnerHome"),   { ssr: false, loading: Spinner });
const ManagerHome    = dynamic(() => import("@/components/dashboards/ManagerHome"),    { ssr: false, loading: Spinner });
const CashierHome    = dynamic(() => import("@/components/dashboards/CashierHome"),    { ssr: false, loading: Spinner });
const AccountantHome = dynamic(() => import("@/components/dashboards/AccountantHome"), { ssr: false, loading: Spinner });
const PulseAdminHome = dynamic(() => import("@/components/dashboards/PulseAdminHome"), { ssr: false, loading: Spinner });
const LenderHome     = dynamic(() => import("@/components/dashboards/LenderHome"),     { ssr: false, loading: Spinner });
const AdvisorHome    = dynamic(() => import("@/components/dashboards/AdvisorHome"),    { ssr: false, loading: Spinner });

export default function HomePage() {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <AppShell>
      {role === "pulse_admin"                      && <PulseAdminHome />}
      {(role === "sme_owner" || role === "admin")  && <SmeOwnerHome />}
      {role === "manager"                          && <ManagerHome />}
      {role === "cashier"                          && <CashierHome />}
      {role === "accountant"                       && <AccountantHome />}
      {role === "lender"                           && <LenderHome />}
      {role === "databridge_advisor"               && <AdvisorHome />}
      {role === "viewer"                           && <SmeOwnerHome />}
    </AppShell>
  );
}
