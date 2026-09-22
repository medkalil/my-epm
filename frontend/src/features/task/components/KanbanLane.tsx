import { Card, Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ReactNode } from 'react';
import type { TaskStatus } from '@/types/common';
import type { Task } from '../types/task.types';
import { TaskBoardCard } from './TaskBoardCard';

interface KanbanLaneProps {
  status: TaskStatus;
  label: string;
  color: string;
  tasks: Task[];
  projectNameOf: (projectId: number) => string | undefined;
  onQuickCreate: (status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function KanbanLane({
  status,
  label,
  color,
  tasks,
  projectNameOf,
  onQuickCreate,
  onEdit,
  onDelete,
}: KanbanLaneProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } });

  const header: ReactNode = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span>
        <span
          style={{
            display: 'inline-block',
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: color,
            marginRight: 8,
          }}
        />
        <Typography.Text strong>{label}</Typography.Text>
        <Typography.Text type="secondary"> ({tasks.length})</Typography.Text>
      </span>
      <Button
        type="text"
        size="small"
        icon={<PlusOutlined />}
        onClick={() => onQuickCreate(status)}
      />
    </div>
  );

  return (
    <Card
      title={header}
      size="small"
      style={{
        borderRadius: 12,
        border: '1px solid #f0f0f0',
        borderTop: `3px solid ${color}`,
        backgroundColor: '#fafafa',
        height: '100%',
      }}
      bodyStyle={{ padding: 8 }}
    >
      <div
        ref={setNodeRef}
        style={{
          minHeight: 140,
          borderRadius: 8,
          padding: 4,
          transition: 'background-color 0.15s ease',
          backgroundColor: isOver ? '#e6f0ff' : 'transparent',
        }}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.map((task) => (
              <TaskBoardCard
                key={task.id}
                task={task}
                projectName={projectNameOf(task.projectId)}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
        {tasks.length === 0 && (
          <Typography.Text
            type="secondary"
            style={{ display: 'block', textAlign: 'center', padding: 24, fontSize: 12 }}
          >
            Drop tasks here
          </Typography.Text>
        )}
      </div>
    </Card>
  );
}