
export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  energyLevel: number; // 1-5
  dueDate?: string;
  status: 'pending' | 'completed';
  reasoning?: string;
  adjustedPriority?: Priority;
  completed_at?: string;
  createdAt: string;
}

export type TaskListProps = {
    tasks: Task[];
    onTaskStatusChange: (taskId: string, status: 'pending' | 'completed') => void;
    onDeleteTask: (taskId: string) => void;
    onTaskPriorityChange: (taskId: string, priority: Priority) => void;
};
