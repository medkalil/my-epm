import { useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'antd';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { TaskStatus } from '@/types/common';
import { useProjects } from '@/features/project/api/project.queries';
import { useMoveTask } from '../api/task.queries';
import type { Task } from '../types/task.types';
import { KanbanLane } from './KanbanLane';
import { TaskCard } from './TaskCard';

const LANES: Array<{ status: TaskStatus; label: string; color: string }> = [
  { status: TaskStatus.TODO, label: 'To Do', color: '#1677ff' },
  { status: TaskStatus.IN_PROGRESS, label: 'In Progress', color: '#faad14' },
  { status: TaskStatus.IN_REVIEW, label: 'In Review', color: '#722ed1' },
  { status: TaskStatus.DONE, label: 'Done', color: '#52c41a' },
];

function applyMove(tasks: Task[], activeId: number, targetStatus: TaskStatus, targetIndex: number): Task[] {
  const without = tasks.filter((t) => t.id !== activeId);
  const active = tasks.find((t) => t.id === activeId);
  if (!active) return tasks;

  const order: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.DONE];
  const next: Task[] = [];

  for (const st of order) {
    const lane = without
      .filter((t) => (t.status || TaskStatus.TODO) === st)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((t) => ({ ...t }));

    if (st === targetStatus) {
      lane.splice(Math.max(0, Math.min(targetIndex, lane.length)), 0, {
        ...active,
        status: targetStatus,
      });
    }
    lane.forEach((t, i) => {
      t.position = i;
    });
    next.push(...lane);
  }
  return next;
}

interface TaskBoardProps {
  tasks: Task[];
  onQuickCreate: (status: TaskStatus) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskBoard({ tasks, onQuickCreate, onEdit, onDelete }: TaskBoardProps) {
  const { data: projectsData = [] } = useProjects();
  const moveMutation = useMoveTask();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null);

  const displayTasks = optimisticTasks ?? tasks;

  useEffect(() => {
    setOptimisticTasks(null);
  }, [tasks]);

  const projectNameOf = useMemo(() => {
    const map = new Map(projectsData.map((p) => [p.id, p.name]));
    return (projectId: number) => map.get(projectId);
  }, [projectsData]);

  const grouped = useMemo(() => {
    const g: Record<TaskStatus, Task[]> = {
      [TaskStatus.TODO]: [],
      [TaskStatus.IN_PROGRESS]: [],
      [TaskStatus.IN_REVIEW]: [],
      [TaskStatus.DONE]: [],
    };
    for (const t of displayTasks) {
      const st = (t.status || TaskStatus.TODO) as TaskStatus;
      g[st] ??= [];
      g[st].push(t);
    }
    for (const st of Object.keys(g) as TaskStatus[]) {
      g[st].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    }
    return g;
  }, [displayTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 8 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = displayTasks.find((t) => t.id === Number(event.active.id));
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = Number(active.id);
    const overIsLane = typeof over.id === 'string';
    const overStatus = overIsLane
      ? (over.id as TaskStatus)
      : ((over.data.current?.status as TaskStatus) ?? TaskStatus.TODO);

    const laneIds = displayTasks
      .filter((t) => (t.status || TaskStatus.TODO) === overStatus)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((t) => t.id);

    const index = overIsLane
      ? laneIds.length
      : Math.max(0, laneIds.indexOf(Number(over.id)));

    console.log("############ before next")
    const next = applyMove(displayTasks, taskId, overStatus, index);
    const temp = next.map((t) => t.id).join() === displayTasks.map((t) => t.id).join()
    console.log("############ mainly next", temp)
    if (next.map((t) => t.id).join() === displayTasks.map((t) => t.id).join()) return;
    console.log("############ after next")

    const moved = next.find((t) => t.id === taskId);
    setOptimisticTasks(next);
    moveMutation.mutate({
      taskId,
      payload: { status: overStatus, position: moved?.position ?? index },
    });
    console.log("############ executed mutation")
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <Row gutter={[16, 16]}>
        {LANES.map((lane) => (
          <Col xs={24} sm={12} lg={6} key={lane.status}>
            <KanbanLane
              status={lane.status}
              label={lane.label}
              color={lane.color}
              tasks={grouped[lane.status]}
              projectNameOf={projectNameOf}
              onQuickCreate={onQuickCreate}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Col>
        ))}
      </Row>
      <DragOverlay>
        {activeTask ? (
          <div style={{ width: 280 }}>
            <TaskCard task={activeTask} projectName={projectNameOf(activeTask.projectId)} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}