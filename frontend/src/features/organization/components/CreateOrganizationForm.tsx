import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, Input, Select, Button, Space, App } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { OrgRole } from '@/types/common';
import { OrgRole as OrgRoleEnum } from '@/types/common';
import {
  createOrganizationSchema,
  type CreateOrganizationFormValues,
} from '../schemas/organization.schema';
import { useCreateOrganization } from '../api/organization.queries';
import { getApiErrorMessage } from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/paths';

interface CreateOrganizationFormProps {
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
  onComplete: () => void;
}

const ROLE_OPTIONS: Array<{ label: string; value: OrgRole }> = [
  { label: 'Owner', value: OrgRoleEnum.OWNER },
  { label: 'Admin', value: OrgRoleEnum.ADMIN },
  { label: 'Member', value: OrgRoleEnum.MEMBER },
  { label: 'Guest', value: OrgRoleEnum.GUEST },
];

export function CreateOrganizationForm({
  currentStep,
  onPrev,
  onNext,
  onComplete,
}: CreateOrganizationFormProps) {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const createMutation = useCreateOrganization();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: '', slug: '', description: '' },
  });

  const onSubmit = async (values: CreateOrganizationFormValues) => {
    try {
      const org = await createMutation.mutateAsync({
        name: values.name,
        slug: values.slug,
      });
      navigate(ROUTES.organizations.detail(org.id));
      onComplete();
    } catch (error) {
      message.error(getApiErrorMessage(error));
    }
  };

  if (currentStep === 1) {
    return (
      <Form layout="vertical">
        <Form.Item
          label="Organization name"
          validateStatus={errors.name ? 'error' : ''}
          help={errors.name?.message}
        >
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input placeholder="e.g. Acme Corporation" {...field} />
            )}
          />
        </Form.Item>
        <Form.Item
          label="Slug"
          validateStatus={errors.slug ? 'error' : ''}
          help={errors.slug?.message}
        >
          <Controller
            control={control}
            name="slug"
            render={({ field }) => (
              <Input placeholder="e.g. acme-corp" {...field} />
            )}
          />
        </Form.Item>
        <Button type="primary" icon={<RightOutlined />} iconPosition="end" onClick={onNext} block>
          Continue
        </Button>
      </Form>
    );
  }

  const name = watch('name');

  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <Form.Item
        label={`Add team members to "${name || 'your organization'}"`}
        help="You can add members later from the Team & Access section."
      >
        <Select
          mode="multiple"
          placeholder="Search users to invite (optional)"
          options={[]}
          disabled
        />
      </Form.Item>
      <Form.Item label="Default role for new members">
        <Select options={ROLE_OPTIONS} defaultValue={OrgRoleEnum.MEMBER} />
      </Form.Item>
      <Space style={{ width: '100%' }}>
        <Button icon={<LeftOutlined />} onClick={onPrev}>
          Back
        </Button>
        <Button
          type="primary"
          htmlType="submit"
          loading={createMutation.isPending}
          block
        >
          Create organization
        </Button>
      </Space>
    </Form>
  );
}