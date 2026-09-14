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
  },
  organizations: {
    base: '/organizations',
    my: '/organizations/my',
    bySlug: (slug: string) => `/organizations/slug/${slug}`,
    members: (id: number) => `/organizations/${id}/members`,
    switch: (id: number) => `/organizations/${id}/switch`,
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
    byProject: (projectId: number) => `/tasks/project/${projectId}`,
    byOrganization: (orgId: number) => `/tasks/organization/${orgId}`,
    byUser: (userId: number) => `/tasks/user/${userId}`,
  },
  users: {
    base: '/users',
    byId: (id: number) => `/users/${id}`,
  },
} as const;

export const DEFAULT_PAGE_SIZE = 10;
