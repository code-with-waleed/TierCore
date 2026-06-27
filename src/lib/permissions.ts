export const ROLES = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

const ROLE_HIERARCHY: Record<Role, number> = {
  USER: 0,
  MODERATOR: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole as Role] ?? -1
  const requiredLevel = ROLE_HIERARCHY[requiredRole as Role] ?? -1
  return userLevel >= requiredLevel
}

export function hasPermission(userRole: string, permission: string): boolean {
  const permissions: Record<string, string[]> = {
    'matches:submit': ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'matches:approve': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'matches:reject': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'matches:dispute': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'players:edit': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'players:ban': ['ADMIN', 'SUPER_ADMIN'],
    'players:delete': ['SUPER_ADMIN'],
    'tiers:manage': ['ADMIN', 'SUPER_ADMIN'],
    'seasons:manage': ['ADMIN', 'SUPER_ADMIN'],
    'settings:manage': ['SUPER_ADMIN'],
    'flags:view': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'flags:resolve': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
    'audit:view': ['ADMIN', 'SUPER_ADMIN'],
    'admin:access': ['ADMIN', 'SUPER_ADMIN'],
    'moderator:access': ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'],
  }

  const allowedRoles = permissions[permission]
  if (!allowedRoles) return false
  return allowedRoles.some(role => hasRole(userRole, role))
}

export const PERMISSIONS = {
  SUBMIT_MATCH: 'matches:submit',
  APPROVE_MATCH: 'matches:approve',
  REJECT_MATCH: 'matches:reject',
  DISPUTE_MATCH: 'matches:dispute',
  EDIT_PLAYER: 'players:edit',
  BAN_PLAYER: 'players:ban',
  DELETE_PLAYER: 'players:delete',
  MANAGE_TIERS: 'tiers:manage',
  MANAGE_SEASONS: 'seasons:manage',
  MANAGE_SETTINGS: 'settings:manage',
  VIEW_FLAGS: 'flags:view',
  RESOLVE_FLAGS: 'flags:resolve',
  VIEW_AUDIT: 'audit:view',
  ADMIN_ACCESS: 'admin:access',
  MODERATOR_ACCESS: 'moderator:access',
} as const
