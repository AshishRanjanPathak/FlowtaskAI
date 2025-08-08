
'use client';

import { useEffect, useRef } from 'react';
import { Task, Priority, TaskListProps } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Zap, Flame, BatteryMedium, BatteryLow } from 'lucide-react';
import Image from 'next/image';
import anime from 'animejs';


const PriorityGroup = ({ title, icon, tasks, onTaskStatusChange, onTaskPriorityChange, onDeleteTask }: { title: string; icon: React.ReactNode; tasks: Task[] } & TaskListProps) => {
  const groupRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (groupRef.current) {
        anime({
            targets: groupRef.current.children,
            translateY: [-30, 0],
            opacity: [0, 1],
            delay: anime.stagger(100),
            easing: 'easeOutExpo'
        });
    }
  }, [tasks]);

  if (tasks.length === 0) return null;

  return (
    <div>
      <h2 className="text-xl font-headline font-bold flex items-center gap-3 mb-4 capitalize">
        {icon}
        {title} Priority
      </h2>
      <div className="space-y-3" ref={groupRef}>
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} onStatusChange={onTaskStatusChange} onPriorityChange={onTaskPriorityChange} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
};

export function TaskList({ tasks, onTaskStatusChange, onTaskPriorityChange, onDeleteTask }: TaskListProps) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed').sort((a,b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime());

  const priorityGroups: Record<Priority, Task[]> = {
    urgent: pendingTasks.filter((t) => (t.adjustedPriority || t.priority) === 'urgent'),
    high: pendingTasks.filter((t) => (t.adjustedPriority || t.priority) === 'high'),
    medium: pendingTasks.filter((t) => (t.adjustedPriority || t.priority) === 'medium'),
    low: pendingTasks.filter((t) => (t.adjustedPriority || t.priority) === 'low'),
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 px-8 bg-card rounded-lg border-2 border-dashed">
        <Image src="https://placehold.co/300x200.png" alt="Tasks illustration" width={300} height={200} className="mx-auto mb-6 rounded-md" data-ai-hint="illustration tasks" />
        <h2 className="text-2xl font-headline font-bold">Your Task List is Empty</h2>
        <p className="text-muted-foreground mt-2">
          Use the 'Brain Dump' to add your first task.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PriorityGroup title="urgent" icon={<Flame />} tasks={priorityGroups.urgent} onTaskStatusChange={onTaskStatusChange} onTaskPriorityChange={onTaskPriorityChange} onDeleteTask={onDeleteTask} />
      <PriorityGroup title="high" icon={<Zap />} tasks={priorityGroups.high} onTaskStatusChange={onTaskStatusChange} onTaskPriorityChange={onTaskPriorityChange} onDeleteTask={onDeleteTask} />
      <PriorityGroup title="medium" icon={<BatteryMedium />} tasks={priorityGroups.medium} onTaskStatusChange={onTaskStatusChange} onTaskPriorityChange={onTaskPriorityChange} onDeleteTask={onDeleteTask}/>
      <PriorityGroup title="low" icon={<BatteryLow />} tasks={priorityGroups.low} onTaskStatusChange={onTaskStatusChange} onTaskPriorityChange={onTaskPriorityChange} onDeleteTask={onDeleteTask}/>

      {completedTasks.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="completed">
            <AccordionTrigger>
              <h2 className="text-lg font-headline font-semibold flex items-center gap-2">
                <CheckCircle2 className="text-gray-500" />
                Completed ({completedTasks.length})
              </h2>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} onStatusChange={onTaskStatusChange} onPriorityChange={onTaskPriorityChange} onDelete={onDeleteTask} />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
