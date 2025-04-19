/**
 * Role levels:
 * 1 = member
 * 2 = cell_leader
 * 3 = ministry_leader
 * 4 = admin
 */
export enum RoleLevel {
  Member = 1,
  CellLeader = 2,
  MinistryLeader = 3,
  Admin = 4,
}

/**
 * Context types for role-based access
 */
export enum ContextType {
  None = "none",
  CellGroup = "cell_group",
  Ministry = "ministry",
  District = "district",
  Church = "church",
}

/**
 * Get the current user's role level - always returns admin level
 */
export async function getUserRoleLevel(): Promise<number> {
  // Always return admin level for compatibility
  return 4;
}

/**
 * Get the current user's role context - always returns null
 */
export async function getUserRoleContext(): Promise<any> {
  // Always return null for compatibility
  return null;
}

/**
 * Check if the current user has the required role level - always returns true
 */
export async function hasRequiredRoleLevel(
  requiredLevel: number
): Promise<boolean> {
  // Always return true for compatibility
  return true;
}

/**
 * Check if the current user has access to a specific context - always returns true
 */
export async function hasContextAccess(
  contextType: ContextType,
  contextId: string
): Promise<boolean> {
  // Always return true for compatibility
  return true;
}

/**
 * Check if the current user has the required role level and context access - always returns true
 */
export async function checkRoleAccess(
  requiredLevel: number,
  contextType?: ContextType,
  contextId?: string
): Promise<boolean> {
  // Always return true for compatibility
  return true;
}

/**
 * Get the role name from a role level
 */
export function getRoleName(roleLevel: number): string {
  switch (roleLevel) {
    case RoleLevel.Admin:
      return "Administrator";
    case RoleLevel.MinistryLeader:
      return "Ministry Leader";
    case RoleLevel.CellLeader:
      return "Cell Group Leader";
    case RoleLevel.Member:
      return "Member";
    default:
      return "Member";
  }
}

/**
 * Get the role level from a role name
 */
export function getRoleLevel(roleName: string): number {
  switch (roleName.toLowerCase()) {
    case "member":
      return RoleLevel.Member;
    case "cell_leader":
    case "cell leader":
    case "cellleader":
    case "cell group leader":
      return RoleLevel.CellLeader;
    case "ministry_leader":
    case "ministry leader":
    case "ministryleader":
      return RoleLevel.MinistryLeader;
    case "admin":
    case "administrator":
      return RoleLevel.Admin;
    default:
      return RoleLevel.Member;
  }
}

/**
 * Check if user has admin role
 */
export function isAdmin(user: any): boolean {
  return user?.role_level === RoleLevel.Admin || user?.role === "admin";
}

/**
 * Check if user has ministry leader role
 */
export function isMinistryLeader(user: any): boolean {
  return (
    user?.role_level === RoleLevel.MinistryLeader ||
    user?.role_level === RoleLevel.Admin
  );
}

/**
 * Check if user has cell leader role
 */
export function isCellLeader(user: any): boolean {
  return (
    user?.role_level === RoleLevel.CellLeader ||
    user?.role_level === RoleLevel.MinistryLeader ||
    user?.role_level === RoleLevel.Admin
  );
}

/**
 * Check if user has permission for a specific context
 */
export function hasContextPermission(
  user: any,
  contextType: ContextType,
  contextId: string
): boolean {
  if (isAdmin(user)) {
    return true;
  }

  if (contextType === ContextType.CellGroup) {
    // Check if user is leader of this cell group
    return (
      user?.cell_group_id === contextId &&
      user?.role_level >= RoleLevel.CellLeader
    );
  }

  if (contextType === ContextType.Ministry) {
    // Check if user is leader of this ministry
    return (
      user?.ministry_id === contextId &&
      user?.role_level >= RoleLevel.MinistryLeader
    );
  }

  if (contextType === ContextType.District) {
    // Check if user is leader of this district
    return (
      user?.district_id === contextId &&
      user?.role_level >= RoleLevel.MinistryLeader
    );
  }

  return false;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: any, permission: string): boolean {
  if (!user) return false;

  // Admin has all permissions
  if (isAdmin(user)) {
    return true;
  }

  // In a real implementation, we would check the user's permissions from the database
  // For now, we'll use a simple mapping based on role level
  const rolePermissions: Record<number, string[]> = {
    [RoleLevel.MinistryLeader]: [
      "manage_cell_groups",
      "manage_attendance",
      "manage_events",
      "view_reports",
    ],
    [RoleLevel.CellLeader]: ["manage_attendance"],
    [RoleLevel.Member]: [],
  };

  return rolePermissions[user.role_level]?.includes(permission) || false;
}
