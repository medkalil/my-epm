import { Link, useLocation } from 'react-router-dom';
import { useMemo } from 'react';
import { ROUTES } from '@/routes/paths';

const PATH_LABELS: Record<string, string> = {
  [ROUTES.dashboard]: 'Dashboard',
  [ROUTES.projects.base]: 'Projects',
  [ROUTES.tasks.base]: 'Tasks',
  [ROUTES.organizations.base]: 'Organizations',
  'settings': 'Settings',
  'team': 'Team & Access',
  'security': 'Security & Audit',
};

export function Breadcrumb() {
  const location = useLocation();
  const segments = useMemo(() => {
    const parts = location.pathname.split('/').filter(Boolean);
    const items: Array<{ label: string; path: string }> = [];
    let current = '';

    for (const part of parts) {
      current += `/${part}`;
      const label = PATH_LABELS[current] ?? PATH_LABELS[part] ?? part.replace(/-/g, ' ');
      items.push({ label, path: current });
    }

    return items;
  }, [location.pathname]);

  return (
    <div style={{ padding: '12px 24px 0' }}>
      <span>
        <Link to={ROUTES.dashboard}>Home</Link>
        {segments.map((segment, index) => (
          <span key={segment.path}>
            {' / '}
            {index === segments.length - 1 ? (
              <strong>{segment.label}</strong>
            ) : (
              <Link to={segment.path}>{segment.label}</Link>
            )}
          </span>
        ))}
      </span>
    </div>
  );
}