import { Modal, App } from 'antd';
import { useState } from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content?: string;
  okText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  content,
  okText = 'Delete',
  cancelText = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { message } = App.useApp();
  const [confirmLoading, setConfirmLoading] = useState(false);

  const handleOk = async () => {
    try {
      setConfirmLoading(true);
      await onConfirm();
    } catch {
      message.error('Operation failed. Please try again.');
    } finally {
      setConfirmLoading(false);
      onCancel();
    }
  };

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
      confirmLoading={confirmLoading}
      onOk={handleOk}
      onCancel={onCancel}
    >
      {content}
    </Modal>
  );
}