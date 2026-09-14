import { useState } from 'react';
import { Card, Steps, Typography } from 'antd';
import { PageHeader } from '@/components/ui/PageHeader';
import { CreateOrganizationForm } from '../components/CreateOrganizationForm';

export default function OrgCreatePage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { title: 'Organization details' },
    { title: 'Team setup' },
  ];

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <PageHeader title="Create organization" subtitle="Set up your new workspace" />
      <Steps
        current={currentStep}
        items={steps}
        style={{ marginBottom: 32 }}
      />
      <Card>
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          {currentStep === 0
            ? 'Define your organization identity. This will become your workspace boundary.'
            : 'Optional: invite initial members. You can always add them later.'}
        </Typography.Paragraph>
        <CreateOrganizationForm
          currentStep={currentStep + 1}
          onPrev={() => setCurrentStep(0)}
          onNext={() => setCurrentStep(1)}
          onComplete={() => setCurrentStep(0)}
        />
      </Card>
    </div>
  );
}