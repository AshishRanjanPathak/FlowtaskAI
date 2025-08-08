
'use client';

import { useAuth } from '@/app/(auth)/context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getTasksForUser } from '@/services/task-service';
import { Task } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, ListTodo, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';

const profileFormSchema = z.object({
  displayName: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50, { message: "Name cannot exceed 50 characters." }),
});

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({ displayName: user.displayName || '' });
    }
  }, [user, form]);

  useEffect(() => {
    async function fetchTasks() {
      if (!user) return;
      try {
        const userTasks = await getTasksForUser(user.uid);
        setTasks(userTasks);
      } catch (error) {
        console.error("Failed to fetch tasks for profile stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, [user]);

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const getInitials = (email: string | null | undefined) => {
    if (!email) return 'U';
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    try {
      await updateUserProfile({ displayName: values.displayName });
      toast({
        title: 'Success',
        description: 'Your profile has been updated.',
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? ''} />
                <AvatarFallback className="text-3xl">
                    {getInitials(user?.email)}
                </AvatarFallback>
            </Avatar>
          <CardTitle className="font-headline text-3xl">{user?.displayName || user?.email}</CardTitle>
          <CardDescription>Manage your profile and see your progress.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex justify-around text-center">
                {isLoading ? (
                    <>
                        <Skeleton className="h-12 w-24" />
                        <Skeleton className="h-12 w-24" />
                    </>
                ) : (
                    <>
                        <div className="flex flex-col items-center gap-1">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                            <p className="text-2xl font-bold">{completedTasks}</p>
                            <p className="text-sm text-muted-foreground">Tasks Completed</p>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <ListTodo className="w-8 h-8 text-yellow-500" />
                            <p className="text-2xl font-bold">{pendingTasks}</p>
                            <p className="text-sm text-muted-foreground">Tasks Pending</p>
                        </div>
                    </>
                )}
            </div>

            <div className="pt-4 text-center">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            Edit Profile
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={form.control}
                              name="displayName"
                              render={({ field }) => (
                                <FormItem>
                                  <Label htmlFor="displayName">Display Name</Label>
                                  <FormControl>
                                    <Input id="displayName" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="ghost">Cancel</Button>
                                </DialogClose>
                                <Button type="submit" disabled={isUpdating}>
                                    {isUpdating ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
