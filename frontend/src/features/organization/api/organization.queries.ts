import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { organizationService } from '@/services/organization.service';
import type {
  CreateOrganizationRequest,
  AddMemberRequest,
  Organization,
  OrganizationMember,
} from '../types/organization.types';
import { useOrgStore } from '@/stores/orgStore';
import { App } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@/lib/axios';

export function useMyOrganizations() {
  const setOrganizations = useOrgStore((state) => state.setOrganizations);
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);
  const activeOrganization = useOrgStore((state) => state.activeOrganization);

  const query = useQuery<Organization[]>({
    queryKey: ['organizations', 'mine'],
    queryFn: () => organizationService.getMine(),
  });

  useEffect(() => {
    if (query.data) {
      setOrganizations(query.data);
      if (!activeOrganization && query.data.length > 0) {
        setActiveOrganization(query.data[0] ?? null);
      }
    }
  }, [query.data, setOrganizations, setActiveOrganization, activeOrganization]);

  return query;
}

export function useOrganizationMembers(orgId: number | undefined) {
  return useQuery<OrganizationMember[]>({
    queryKey: ['organizations', orgId, 'members'],
    queryFn: () => organizationService.listMembers(orgId!),
    enabled: !!orgId,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const addOrganization = useOrgStore((state) => state.addOrganization);

  return useMutation({
    mutationFn: (payload: CreateOrganizationRequest) => organizationService.create(payload),
    onSuccess: (org) => {
      addOrganization(org);
      void queryClient.invalidateQueries({ queryKey: ['organizations', 'mine'] });
      message.success(`Organization "${org.name}" created successfully`);
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useSwitchOrganization() {
  const queryClient = useQueryClient();
  const { message } = App.useApp();
  const setActiveOrganization = useOrgStore((state) => state.setActiveOrganization);
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (orgId: number) => organizationService.switchActive(orgId),
    onSuccess: (org) => {
      setActiveOrganization(org);
      void queryClient.invalidateQueries();
      message.success(`Switched to ${org.name}`);

      const match = location.pathname.match(/^\/organizations\/(\d+)(.*)$/);
      if (match) {
        const subpath = match[2] || '';
        navigate(`/organizations/${org.id}${subpath}`, { replace: true });
      }
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}

export function useAddMember(orgId: number | undefined) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  return useMutation({
    mutationFn: (payload: AddMemberRequest) =>
      organizationService.addMember(orgId!, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['organizations', orgId, 'members'],
      });
      message.success('Member added successfully');
    },
    onError: (error) => message.error(getApiErrorMessage(error)),
  });
}