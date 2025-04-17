import { getSupabaseClient } from './supabase';

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
  Admin = 4
}

/**
 * Context types for role-based access
 */
export enum ContextType {
  CellGroup = 'cell_group_ids',
  Ministry = 'ministry_ids',
  District = 'district_ids'
}

/**
 * Get the current user's role level
 */
export async function getUserRoleLevel(): Promise<number> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return 0;
  
  // First check metadata
  const roleLevel = user.user_metadata?.role_level;
  if (roleLevel) return Number(roleLevel);
  
  // Then check the members table
  const { data: member } = await supabase
    .from('members')
    .select('role_level')
    .eq('id', user.id)
    .single();
    
  if (member?.role_level) return member.role_level;
  
  // Default to member (1) if no role found
  return 1;
}

/**
 * Get the current user's role context
 */
export async function getUserRoleContext(): Promise<any> {
  const supabase = getSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  // First check metadata
  const roleContext = user.user_metadata?.role_context;
  if (roleContext) return roleContext;
  
  // Then check the members table
  const { data: member } = await supabase
    .from('members')
    .select('role_context')
    .eq('id', user.id)
    .single();
    
  return member?.role_context || null;
}

/**
 * Check if the current user has the required role level
 * @param requiredLevel The minimum role level required
 */
export async function hasRequiredRoleLevel(requiredLevel: number): Promise<boolean> {
  const userRoleLevel = await getUserRoleLevel();
  return userRoleLevel >= requiredLevel;
}

/**
 * Check if the current user has access to a specific context
 * @param contextType The type of context to check
 * @param contextId The ID of the context to check
 */
export async function hasContextAccess(contextType: ContextType, contextId: string): Promise<boolean> {
  const userRoleLevel = await getUserRoleLevel();
  
  // Admins have access to everything
  if (userRoleLevel >= RoleLevel.Admin) return true;
  
  const roleContext = await getUserRoleContext();
  if (!roleContext) return false;
  
  const contextIds = roleContext[contextType];
  if (!contextIds) return false;
  
  // Check if the context ID is in the user's context
  return Array.isArray(contextIds) 
    ? contextIds.includes(contextId)
    : contextIds === contextId;
}

/**
 * Check if the current user has the required role level and context access
 * @param requiredLevel The minimum role level required
 * @param contextType The type of context to check (optional)
 * @param contextId The ID of the context to check (optional)
 */
export async function checkRoleAccess(
  requiredLevel: number,
  contextType?: ContextType,
  contextId?: string
): Promise<boolean> {
  const userRoleLevel = await getUserRoleLevel();
  
  // Check if user has the required role level
  if (userRoleLevel < requiredLevel) return false;
  
  // Admins have access to everything
  if (userRoleLevel >= RoleLevel.Admin) return true;
  
  // If context check is required
  if (contextType && contextId) {
    return hasContextAccess(contextType, contextId);
  }
  
  return true;
}

/**
 * Get the role name from a role level
 * @param roleLevel The role level
 */
export function getRoleName(roleLevel: number): string {
  switch (roleLevel) {
    case 1: return 'Member';
    case 2: return 'Cell Group Leader';
    case 3: return 'Ministry Leader';
    case 4: return 'Admin';
    default: return 'Member';
  }
}

/**
 * Get the role level from a role name
 * @param roleName The role name
 */
export function getRoleLevel(roleName: string): number {
  switch (roleName.toLowerCase()) {
    case 'member': return 1;
    case 'cell_leader': 
    case 'cell leader': 
    case 'cellleader': 
    case 'cell group leader': return 2;
    case 'ministry_leader': 
    case 'ministry leader': 
    case 'ministryleader': return 3;
    case 'admin': 
    case 'administrator': return 4;
    default: return 1;
  }
}
