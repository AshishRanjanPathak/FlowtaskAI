
'use client';

import React, { useRef } from 'react';
import { Task, Priority } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, Calendar, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { format, parseISO } from 'date-fns';
import anime from 'animejs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type TaskItemProps = {
  task: Task;
  onStatusChange: (taskId: string, status: 'pending' | 'completed') => void;
  onDelete: (taskId: string) => void;
  onPriorityChange: (taskId: string, priority: Priority) => void;
};

const getPriorityBadgeVariant = (priority?: Priority): BadgeProps['variant'] => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

const priorityOptions: Priority[] = ['low', 'medium', 'high', 'urgent'];

export function TaskItem({ task, onStatusChange, onDelete, onPriorityChange }: TaskItemProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleCheckedChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      // Animate out before marking as complete
      anime({
        targets: cardRef.current,
        opacity: [1, 0],
        scale: [1, 0.9],
        duration: 400,
        easing: 'easeInQuad',
        complete: () => {
          onStatusChange(task.id, 'completed');
        },
      });
    } else {
      onStatusChange(task.id, 'pending');
    }
  };

  const formattedDueDate = task.dueDate ? format(parseISO(task.dueDate), 'MMM d, yyyy') : null;
  const currentPriority = task.adjustedPriority || task.priority;

  return (
    <Card 
      ref={cardRef}
      className={`p-4 transition-all duration-200 border-l-4 ${task.status === 'completed' ? 'opacity-60 bg-muted/50 border-transparent' : 'bg-card border-primary hover:border-accent'}`}
    >
      <div className="flex items-center gap-4">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.status === 'completed'}
          onCheckedChange={handleCheckedChange}
          className="h-6 w-6 rounded-full"
        />
        <div className="flex-grow">
          <label htmlFor={`task-${task.id}`} className={`font-medium text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </label>
          {formattedDueDate && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
              <Calendar className="h-3 w-3" />
              <span>{formattedDueDate}</span>
            </div>
          )}
        </div>
        
        <Select value={currentPriority} onValueChange={(value) => onPriorityChange(task.id, value as Priority)}>
          <SelectTrigger className="w-[120px] capitalize text-sm h-9">
            <SelectValue placeholder="Set priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((p) => (
              <SelectItem key={p} value={p} className="capitalize">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" disabled={!task.reasoning}>
              <Info className="h-4 w-4" />
              <span className="sr-only">Task Details</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-headline">{task.title}</DialogTitle>
              <DialogDescription>
                {task.description || 'No detailed description.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <h3 className="font-semibold font-headline">AI Prioritization Details</h3>
              <p><strong>Reasoning:</strong> {task.reasoning || 'Not available.'}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Original Priority:</strong> <Badge variant={getPriorityBadgeVariant(task.priority)} className="capitalize">{task.priority}</Badge>
                </div>
                <div>
                  <strong>Adjusted Priority:</strong> <Badge variant={getPriorityBadgeVariant(task.adjustedPriority || task.priority)} className="capitalize">{task.adjustedPriority || task.priority}</Badge>
                </div>
                <div>
                  <strong>Energy Level:</strong> <Badge variant="outline">{task.energyLevel}/5</Badge>
                </div>
                {formattedDueDate && (
                  <div>
                    <strong>Due Date:</strong> <Badge variant="outline">{formattedDueDate}</Badge>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => onDelete(task.id)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Task</span>
        </Button>
      </div>
    </Card>
  );
}
