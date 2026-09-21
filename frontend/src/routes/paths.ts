export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  projects: {
    base: '/projects',
    detail: (id: string | number) => `/projects/${id}`, // TODO: projects detail
  },
  tasks: {
    base: '/tasks',
    detail: (id: string | number) => `/tasks/${id}`,
  },
  organizations: {
    base: '/organizations',
    create: '/organizations/create',
    detail: (id: string | number) => `/organizations/${id}`,
    settings: (id: string | number) => `/organizations/${id}/settings`,
    team: (id: string | number) => `/organizations/${id}/team`,
    security: (id: string | number) => `/organizations/${id}/security`,
  },
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  notFound: '*',
} as const;