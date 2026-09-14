import { create } from 'zustand';
import type { Organization } from '@/features/organization/types/organization.types';

interface OrgState {
  organizations: Organization[];
  activeOrganization: Organization | null;
  setOrganizations: (organizations: Organization[]) => void;
  setActiveOrganization: (organization: Organization | null) => void;
  clear: () => void;
}

export const useOrgStore = create<OrgState>()((set) => ({
  organizations: [],
  activeOrganization: null,
  setOrganizations: (organizations) => set({ organizations }),
  setActiveOrganization: (organization) => set({ activeOrganization: organization }),
  clear: () => set({ organizations: [], activeOrganization: null }),
}));