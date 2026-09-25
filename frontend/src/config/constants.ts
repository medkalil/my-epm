export const APP_NAME = 'MY-EPM';
export const APP_DESCRIPTION = 'Enterprise Project Management Platform';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'epm.access_token',
  REFRESH_TOKEN: 'epm.refresh_token',
  ACTIVE_ORG: 'epm.active_org',
  THEME: 'epm.theme',
  LOCALE: 'epm.locale',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_SIZE: 10,
  PAGE_SIZE_OPTIONS: ['10', '20', '50', '100'],
} as const;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refreshtoken',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
  },
  organizations: {
    base: '/organizations',
    my: '/organizations/my',
    bySlug: (slug: string) => `/organizations/slug/${slug}`,
    members: (id: number) => `/organizations/${id}/members`,
    switch: (id: number) => `/organizations/${id}/switch`,
    joinRequests: (orgId: number) => `/organizations/${orgId}/join-requests`,
    approveJoinRequest: (orgId: number, requestId: number) =>
      `/organizations/${orgId}/join-requests/${requestId}/approve`,
    rejectJoinRequest: (orgId: number, requestId: number) =>
      `/organizations/${orgId}/join-requests/${requestId}/reject`,
  },
  projects: {
    base: '/projects',
    byId: (id: number) => `/projects/${id}`,
    byOrganization: (orgId: number) => `/projects/organization/${orgId}`,
    members: (id: number) => `/projects/${id}/members`,
  },
  tasks: {
    base: '/tasks',
    byId: (id: number) => `/tasks/${id}`,
    move: (id: number) => `/tasks/${id}/move`,
    byProject: (projectId: number) => `/tasks/project/${projectId}`,
    byOrganization: (orgId: number) => `/tasks/organization/${orgId}`,
    byUser: (userId: number) => `/tasks/user/${userId}`,
  },
  users: {
    base: '/users',
    byId: (id: number) => `/users/${id}`,
  },
  audit: {
    base: '/audit-logs',
    stats: '/audit-logs/stats',
    filterOptions: '/audit-logs/filter-options',
    export: '/audit-logs/export',
  },
} as const;

export const AUDIT_RANGE_OPTIONS = [
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Custom range', value: 'custom' },
] as const;

export const AUDIT_RANGE_MS: Record<'24h' | '7d' | '30d', number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

export const DEFAULT_AUDIT_RANGE = '24h';

export const DEFAULT_PAGE_SIZE = 10;
