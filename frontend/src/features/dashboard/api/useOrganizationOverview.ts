import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { organizationService } from '@/services/organization.service';
import { userService } from '@/services/user.service';
import { useOrgStore } from '@/stores/orgStore';
import type { Organization } from '@/features/organization/types/organization.types';
import type { User } from '@/features/user/types/user.types';

export function useOrganizationOverview() {
  const setOrganizations = useOrgStore((state) => state.setOrganizations);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);

  const myOrgsQuery = useQuery<Organization[]>({
    queryKey: ['organizations', 'mine'],
    queryFn: () => organizationService.getMine(),
  });

  const usersQuery = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => userService.list(),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (myOrgsQuery.data) {
      setOrganizations(myOrgsQuery.data);
      if (!activeOrganization && myOrgsQuery.data.length > 0) {
        setActiveOrganization(myOrgsQuery.data[0] ?? null);
      }
    }
  }, [myOrgsQuery.data, setOrganizations, setActiveOrganization, activeOrganization]);

  return { myOrgsQuery, usersQuery };
}