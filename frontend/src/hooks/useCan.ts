import { useOrgStore } from '@/stores/orgStore';
import type { OrgRole } from '@/types/common';

export type PermissionResource = 'overview' | 'projects' | 'tasks';
export type PermissionAction = 'view' | 'create' | 'update' | 'delete';

const RBAC_MATRIX: Record<OrgRole, Record<PermissionResource, PermissionAction[]>> = {
  OWNER: {
    overview: ['view', 'create', 'update', 'delete'],
    projects: ['view', 'create', 'update', 'delete'],
    tasks: ['view', 'create', 'update', 'delete'],
  },
  ADMIN: {
    overview: ['view', 'create', 'update', 'delete'],
    projects: ['view', 'create', 'update', 'delete'],
    tasks: ['view', 'create', 'update', 'delete'],
  },
  MEMBER: {
    overview: ['view', 'create', 'update'],
    projects: ['view', 'create', 'update'],
    tasks: ['view', 'create', 'update'],
  },
  GUEST: {
    overview: ['view'],
    projects: ['view'],
    tasks: ['view'],
  },
};

export function useCan() {
  const myRole = useOrgStore((state) => state.activeOrganization?.myRole ?? null);

  const can = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!myRole) {
      return false;
    }
    return RBAC_MATRIX[myRole][resource].includes(action);
  };

  const hasRole = (...roles: OrgRole[]): boolean => !!myRole && roles.includes(myRole);
  const isAdmin = hasRole('OWNER', 'ADMIN');

  return { role: myRole, can, hasRole, isAdmin };
}