
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TaskInput } from '@/components/flow-task/TaskInput';
import { MoodLogger } from '@/components/flow-task/MoodLogger';
import { TaskList } from '@/components/flow-task/TaskList';
import { Task, Priority } from '@/lib/types';
import { parseTask } from '@/ai/flows/task-parser';
import { prioritizeTasks } from '@/ai/flows/task-prioritizer';
import { textToSpeech } from '@/ai/flows/tts';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/app/(auth)/context';
import { Button } from '@/components/ui/button';
import { addTaskForUser, getTasksForUser, updateTaskForUser, deleteTaskForUser } from '@/services/task-service';
import { differenceInMinutes, parseISO } from 'date-fns';
import { Bell, Sparkles, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mood, setMood] = useState('Neutral');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [isParsing, setIsParsing] = useState(false);
  const [isPrioritizing, setIsPrioritizing] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [remindedTaskIds, setRemindedTaskIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user, signOut } = useAuth();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setIsLoadingTasks(true);
    try {
      const userTasks = await getTasksForUser(user.uid);
      setTasks(userTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load your tasks.',
      });
    } finally {
      setIsLoadingTasks(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    const checkDeadlines = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.status === 'pending' && task.dueDate && !remindedTaskIds.has(task.id)) {
          const dueDate = parseISO(task.dueDate);
          const minutesUntilDue = differenceInMinutes(dueDate, now);

          if (minutesUntilDue > 0 && minutesUntilDue <= 10) {
            toast({
              title: (
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  <span>Upcoming Task</span>
                </div>
              ),
              description: `Your task "${task.title}" is due in ${minutesUntilDue} minutes.`,
            });
            setRemindedTaskIds(prev => new Set(prev).add(task.id));
          }
        }
      });
    };

    const intervalId = setInterval(checkDeadlines, 60000); // Check every minute
    checkDeadlines(); // Check once on mount

    return () => clearInterval(intervalId);
  }, [tasks, toast, remindedTaskIds]);

  const handleAddTask = async (text: string) => {
    if (!text.trim() || !user) return;
    setIsParsing(true);
    try {
      const parsedData = await parseTask({ taskInput: text });
      const newTask = await addTaskForUser(user.uid, parsedData);
      setTasks((prevTasks) => [...prevTasks, newTask]);
      
      const confirmationText = `OK. I've added a new task: ${newTask.title}.`;
      const audioResponse = await textToSpeech(confirmationText);
      if (audioRef.current && audioResponse.media) {
        audioRef.current.src = audioResponse.media;
        audioRef.current.play();
      }

    } catch (error: any) {
      console.error('Failed to parse and add task:', error);
      let description = 'Could not understand or save the task. Please try again.';
      if (error.message && error.message.includes('429')) {
        description = 'You have exceeded the daily limit for AI task creation. Please try again tomorrow.';
      }
      toast({
        variant: 'destructive',
        title: 'Error Adding Task',
        description,
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleTaskStatusChange = async (taskId: string, status: 'pending' | 'completed') => {
    const originalTasks = [...tasks];
    const taskToUpdate = tasks.find(t => t.id === taskId);
    const completed_at = status === 'completed' ? new Date().toISOString() : undefined;
    const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, status, completed_at } : task
    );
    setTasks(updatedTasks);

    try {
        await updateTaskForUser(taskId, { status, completed_at });
        if (status === 'completed' && taskToUpdate) {
            toast({
                title: 'Task Completed!',
                description: `Great job on finishing "${taskToUpdate.title}".`
            });
        }
    } catch (error) {
        console.error('Failed to update task status:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update task status. Please try again.',
        });
        setTasks(originalTasks);
    }
  };

  const handleTaskPriorityChange = async (taskId: string, priority: Priority) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, priority, adjustedPriority: priority } : task
    );
    setTasks(updatedTasks);

    try {
        await updateTaskForUser(taskId, { priority });
    } catch (error) {
        console.error('Failed to update task priority:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not update task priority. Please try again.',
        });
        setTasks(originalTasks);
    }
    };
  
  const deleteTask = async (taskId: string) => {
    const originalTasks = [...tasks];
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    try {
        await deleteTaskForUser(taskId);
    } catch (error) {
        console.error('Failed to delete task:', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the task. Please try again.',
        });
        setTasks(originalTasks);
    }
  };


  const runPrioritization = useCallback(async () => {
    const pendingTasks = tasks.filter((task) => task.status === 'pending');
    if (pendingTasks.length === 0) {
      toast({
        title: 'No Pending Tasks',
        description: 'There are no tasks to prioritize.',
      });
      return;
    }

    setIsPrioritizing(true);
    try {
      // Strips AI-generated fields before sending to the AI to avoid confusing it
      const tasksToSend = pendingTasks.map(({ reasoning, adjustedPriority, ...task }) => task);
      const prioritizedResult = await prioritizeTasks({
        tasks: tasksToSend,
        mood: mood,
        energyLevel: energyLevel,
      });
      
      setTasks((currentTasks) => {
        const completedTasks = currentTasks.filter((t) => t.status === 'completed');
        const updatedPendingTasks = pendingTasks.map((task) => {
          const match = prioritizedResult.find((p) => p.id === task.id);
          return match ? { ...task, ...match } : task;
        });

        const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        updatedPendingTasks.sort((a, b) => {
          const aPrio = priorityOrder[a.adjustedPriority || a.priority] || 0;
          const bPrio = priorityOrder[b.adjustedPriority || b.priority] || 0;
          if (bPrio !== aPrio) {
            return bPrio - aPrio;
          }
          // As a tie-breaker, sort by energy level (higher energy tasks first might be desirable in some contexts)
          return (b.energyLevel || 0) - (a.energyLevel || 0);
        });

        return [...updatedPendingTasks, ...completedTasks];
      });

      toast({
        title: 'Tasks Prioritized!',
        description: 'Your tasks have been sorted by the AI.',
      });

    } catch (error: any) {
      console.error('Failed to prioritize tasks:', error);
      
      let description = 'Could not prioritize tasks. Please try again later.';
      if (error.message && error.message.includes('429')) {
        description = 'You have exceeded the daily limit for AI prioritization. Please try again tomorrow.';
      }
      
      toast({
        variant: 'destructive',
        title: 'Error',
        description,
      });
    } finally {
      setIsPrioritizing(false);
    }
  }, [tasks, mood, energyLevel, toast]);

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <main className="container mx-auto p-4 md:p-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-headline">Welcome, {user?.email}</h1>
          <Button onClick={signOut} variant="outline">Sign Out</Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-8 lg:sticky lg:top-8">
            <TaskInput onAddTask={handleAddTask} isLoading={isParsing} />
            <MoodLogger mood={mood} setMood={setMood} energy={energyLevel} setEnergy={setEnergyLevel} />
          </div>
          <div className="lg:col-span-2">
            <div className="mb-4 text-right">
              <Button onClick={runPrioritization} disabled={isPrioritizing || isLoadingTasks}>
                {isPrioritizing ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                Prioritize with AI
              </Button>
            </div>
            {isLoadingTasks ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : (
              <TaskList tasks={tasks} onTaskStatusChange={handleTaskStatusChange} onTaskPriorityChange={handleTaskPriorityChange} onDeleteTask={deleteTask} />
            )}
          </div>
        </div>
        <audio ref={audioRef} />
      </main>
    </div>
  );
}
