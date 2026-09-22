import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types/task.types';
import { TaskCard } from './TaskCard';

interface TaskBoardCardProps {
  task: Task;
  projectName?: string;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function TaskBoardCard({ task, projectName, onEdit, onDelete }: TaskBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status, task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} projectName={projectName} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}