export type Role =
  | "pulse_admin"
  | "sme_owner"
  | "admin"
  | "manager"
  | "accountant"
  | "cashier"
  | "lender"
  | "databridge_advisor"
  | "viewer";

export const ROLE_LABELS: Record<Role, string> = {
  pulse_admin:        "Platform Admin",
  sme_owner:          "Business Owner",
  admin:              "Admin",
  manager:            "Manager",
  accountant:         "Accountant",
  cashier:            "Cashier",
  lender:             "Lender",
  databridge_advisor: "Advisor",
  viewer:             "Viewer",
};

export function getHomePath(role: Role): string {
  return "/";
}

export const ROUTE_ROLES: Record<string, Role[]> = {
  "/sales":        ["pulse_admin", "sme_owner", "admin", "manager", "cashier"],
  "/stock":        ["pulse_admin", "sme_owner", "admin", "manager"],
  "/finance":      ["pulse_admin", "sme_owner", "admin", "accountant"],
  "/customers":    ["pulse_admin", "sme_owner", "admin", "manager"],
  "/suppliers":    ["pulse_admin", "sme_owner", "admin", "manager"],
  "/reports":      ["pulse_admin", "sme_owner", "admin", "manager", "accountant"],
  "/health-score": ["pulse_admin", "sme_owner", "admin"],
  "/admin":        ["pulse_admin"],
  "/lender":       ["lender", "pulse_admin"],
  "/advisor":      ["databridge_advisor", "pulse_admin"],
  "/settings":     ["pulse_admin", "sme_owner", "admin", "lender", "databridge_advisor"],
};

export function canAccess(role: Role, path: string): boolean {
  const allowed = ROUTE_ROLES[path];
  if (!allowed) return true;
  return allowed.includes(role);
}
