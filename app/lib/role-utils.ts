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
  CellGroup = "cell_group_ids",
  Ministry = "ministry_ids",
  District = "district_ids",
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
    case 1:
      return "Member";
    case 2:
      return "Cell Group Leader";
    case 3:
      return "Ministry Leader";
    case 4:
      return "Admin";
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
      return 1;
    case "cell_leader":
    case "cell leader":
    case "cellleader":
    case "cell group leader":
      return 2;
    case "ministry_leader":
    case "ministry leader":
    case "ministryleader":
      return 3;
    case "admin":
    case "administrator":
      return 4;
    default:
      return 1;
  }
}
