import { lazy, Suspense } from 'react';
import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';

import { AuthLayout, DashboardLayout } from '@/layouts';
import { AuthGuard } from './guards/AuthGuard';
import { GuestGuard } from './guards/GuestGuard';
import { OrgGuard } from './guards/OrgGuard';
import { ROUTES } from './paths';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const ProjectListPage = lazy(() => import('@/features/project/pages/ProjectListPage'));
const ProjectDetailPage = lazy(() => import('@/features/project/pages/ProjectDetailPage'));
const TaskListPage = lazy(() => import('@/features/task/pages/TaskListPage'));
const TaskDetailPage = lazy(() => import('@/features/task/pages/TaskDetailPage'));
const OrgListPage = lazy(() => import('@/features/organization/pages/OrgListPage'));
const OrgCreatePage = lazy(() => import('@/features/organization/pages/OrgCreatePage'));
const OrgDetailPage = lazy(() => import('@/features/organization/pages/OrgDetailPage'));
const OrgSettingsPage = lazy(() => import('@/features/organization/pages/OrgSettingsPage'));
const AuditLogsPage = lazy(() => import('@/features/audit/pages/AuditLogsPage'));
const OrgTeamPage = lazy(() => import('@/features/organization/pages/OrgTeamPage'));

const withFallback = (element: ReactNode) => (
  <Suspense fallback={<LoadingSpinner fullScreen />}>{element}</Suspense>
);

const routes: RouteObject[] = [
  {
    path: ROUTES.home,
    element: withFallback(<HomePage />),
  },
  {
    element: withFallback(<AuthLayout />),
    children: [
      {
        path: ROUTES.login,
        element: (
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        ),
      },
      {
        path: ROUTES.register,
        element: (
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        ),
      },
      {
        path: ROUTES.forgotPassword,
        element: (
          <GuestGuard>
            <ForgotPasswordPage />
          </GuestGuard>
        ),
      },
      {
        path: ROUTES.resetPassword,
        element: (
          <GuestGuard>
            <ResetPasswordPage />
          </GuestGuard>
        ),
      },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: ROUTES.dashboard, element: withFallback(<DashboardPage />) },
          { path: ROUTES.projects.base, element: withFallback(<ProjectListPage />) },
          {
            path: ROUTES.projects.detail(':id'),
            element: withFallback(<ProjectDetailPage />),
          },
          { path: ROUTES.tasks.base, element: withFallback(<TaskListPage />) },
          { path: ROUTES.tasks.detail(':id'), element: withFallback(<TaskDetailPage />) },
          {
            element: <OrgGuard />,
            children: [
              { path: ROUTES.organizations.base, element: withFallback(<OrgListPage />) },
              {
                path: ROUTES.organizations.detail(':id'),
                element: withFallback(<OrgDetailPage />),
              },
              {
                path: ROUTES.organizations.settings(':id'),
                element: withFallback(<OrgSettingsPage />),
              },
              {
                path: ROUTES.organizations.team(':id'),
                element: withFallback(<OrgTeamPage />),
              },
              {
                path: ROUTES.organizations.security(':id'),
                element: withFallback(<AuditLogsPage />),
              },
            ],
          },
          {
            path: ROUTES.organizations.create,
            element: withFallback(<OrgCreatePage />),
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={ROUTES.home} replace /> },
];

export const router = createBrowserRouter(routes);