export const ROLES = {
  SUPER_ADMIN: "super_admin",
  OPS_ADMIN: "ops_admin",
  STORE_MANAGER: "store_manager",
  CATALOG_MANAGER: "catalog_manager",
  REPAIR_MANAGER: "repair_manager",
  SALES_EXECUTIVE: "sales_executive",
  SUPPORT_EXECUTIVE: "support_executive",
  FINANCE_MANAGER: "finance_manager",
  CUSTOMER: "customer",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ADMIN_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.OPS_ADMIN,
  ROLES.STORE_MANAGER,
  ROLES.CATALOG_MANAGER,
  ROLES.REPAIR_MANAGER,
  ROLES.SALES_EXECUTIVE,
  ROLES.SUPPORT_EXECUTIVE,
  ROLES.FINANCE_MANAGER,
];

// Coarse-grained capability map. Fine-grained, store-scoped checks (e.g. a
// Store Manager touching only their assigned store) happen in lib/authz.ts
// on top of this — never rely on this table alone for IDOR-sensitive routes.
export const PERMISSIONS = {
  MANAGE_STORES: "manage_stores",
  MANAGE_STORE_OWN: "manage_store_own",
  MANAGE_PRODUCTS: "manage_products",
  MANAGE_BRANDS: "manage_brands",
  MANAGE_OFFERS: "manage_offers",
  MANAGE_REPAIRS: "manage_repairs",
  MANAGE_REPAIRS_OWN_STORE: "manage_repairs_own_store",
  MANAGE_ORDERS: "manage_orders",
  MANAGE_USERS: "manage_users",
  MANAGE_SECURITY_SETTINGS: "manage_security_settings",
  VIEW_AUDIT_LOG: "view_audit_log",
  EXPORT_DATA: "export_data",
  RESPOND_ENQUIRIES: "respond_enquiries",
  MANAGE_FINANCE: "manage_finance",
} as const;

type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.OPS_ADMIN]: [
    PERMISSIONS.MANAGE_STORES,
    PERMISSIONS.MANAGE_PRODUCTS,
    PERMISSIONS.MANAGE_BRANDS,
    PERMISSIONS.MANAGE_OFFERS,
    PERMISSIONS.MANAGE_REPAIRS,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.RESPOND_ENQUIRIES,
    PERMISSIONS.EXPORT_DATA,
  ],
  [ROLES.STORE_MANAGER]: [PERMISSIONS.MANAGE_STORE_OWN, PERMISSIONS.MANAGE_REPAIRS_OWN_STORE],
  [ROLES.CATALOG_MANAGER]: [PERMISSIONS.MANAGE_PRODUCTS, PERMISSIONS.MANAGE_BRANDS],
  [ROLES.REPAIR_MANAGER]: [PERMISSIONS.MANAGE_REPAIRS],
  [ROLES.SALES_EXECUTIVE]: [PERMISSIONS.RESPOND_ENQUIRIES],
  [ROLES.SUPPORT_EXECUTIVE]: [PERMISSIONS.RESPOND_ENQUIRIES],
  [ROLES.FINANCE_MANAGER]: [PERMISSIONS.MANAGE_FINANCE],
  [ROLES.CUSTOMER]: [],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as Role];
  return Boolean(perms?.includes(permission));
}

export function isAdminRole(role: string): boolean {
  return (ADMIN_ROLES as string[]).includes(role);
}
