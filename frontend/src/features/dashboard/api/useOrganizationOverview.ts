import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { organizationService } from '@/services/organization.service';
import { userService } from '@/services/user.service';
import { useOrgStore } from '@/stores/orgStore';
import type { Page } from '@/types/api';
import type { Organization } from '@/features/organization/types/organization.types';
import type { User } from '@/features/user/types/user.types';

export function useOrganizationOverview() {
  const setOrganizations = useOrgStore((state) => state.setOrganizations);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);

  const myOrgsQuery = useQuery<Page<Organization>>({
    queryKey: ['organizations', 'mine'],
    queryFn: () => organizationService.getMine(),
  });

  const usersQuery = useQuery<Page<User>>({
    queryKey: ['users'],
    queryFn: () => userService.list({ page: 0, size: 100 }),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (myOrgsQuery.data) {
      setOrganizations(myOrgsQuery.data.content);
      if (!activeOrganization && myOrgsQuery.data.content.length > 0) {
        setActiveOrganization(myOrgsQuery.data.content[0] ?? null);
      }
    }
  }, [myOrgsQuery.data, setOrganizations, setActiveOrganization, activeOrganization]);

  return { myOrgsQuery, usersQuery };
}