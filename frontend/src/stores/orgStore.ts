import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Organization } from '@/features/organization/types/organization.types';

interface OrgState {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setOrganizations: (organizations: Organization[]) => void;
  setActiveOrganization: (organization: Organization | null) => void;
  addOrganization: (organization: Organization) => void;
  clear: () => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set) => ({
      organizations: [],
      activeOrganization: null,
      setOrganizations: (organizations) => set({ organizations }),
      setActiveOrganization: (organization) => set({ activeOrganization: organization }),
      addOrganization: (organization) =>
        set((state) => ({
          organizations: [
            ...state.organizations.filter((o) => o.id !== organization.id),
            organization,
          ],
          activeOrganization: organization,
        })),
      clear: () => set({ organizations: [], activeOrganization: null }),
    }),
    {
      name: 'epm-org-store',
    },
  ),
);