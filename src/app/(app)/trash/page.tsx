
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/app/(auth)/context';
import { getTasksForUser, deleteTaskForUser } from '@/services/task-service';
import { Task } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// For now, Trash will show completed items.
// A full "soft delete" implementation would require changes to the data model.

export default function TrashPage() {
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchDeletedTasks = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // For this implementation, we'll consider "completed" tasks as "trash"
      const allTasks = await getTasksForUser(user.uid);
      const completed = allTasks.filter(task => task.status === 'completed');
      setDeletedTasks(completed.sort((a,b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime()));
    } catch (error) {
      console.error('Failed to fetch deleted tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your deleted tasks.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchDeletedTasks();
  }, [fetchDeletedTasks]);

  const handlePermanentDelete = async (taskId: string) => {
    const originalTasks = [...deletedTasks];
    setDeletedTasks(current => current.filter(t => t.id !== taskId));
    try {
      await deleteTaskForUser(taskId);
      toast({
        title: 'Task Deleted',
        description: 'The task has been permanently deleted.',
      });
    } catch (error) {
      console.error('Failed to permanently delete task:', error);
      setDeletedTasks(originalTasks);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not permanently delete the task.',
      });
    }
  };
  
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Trash</CardTitle>
          <CardDescription>
            Here are your completed tasks. You can permanently delete them from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading deleted tasks...</p>
          ) : deletedTasks.length > 0 ? (
            <div className="space-y-3">
              {deletedTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="line-through text-muted-foreground">{task.title}</span>
                  <Button variant="destructive" size="sm" onClick={() => handlePermanentDelete(task.id)}>
                    Delete Forever
                  </Button>
                </div>
              ))}
            </div>
          ) : (
             <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Trash is Empty</AlertTitle>
              <AlertDescription>
                You have no completed tasks to display here.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

