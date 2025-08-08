
'use server';

/**
 * @fileOverview Defines a set of AI tools for managing user tasks.
 * These tools wrap the functions from the task-service and are designed to be
 * used by a Genkit agent (flow) to interact with the user's data.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getTasksForUser, addTaskForUser, updateTaskForUser, deleteTaskForUser, getTaskByIdOrTitle } from '@/services/task-service';
import { parseTask } from '@/ai/flows/task-parser';

// The userId will be passed in the context by the flow
const ToolInputWithUserId = z.object({
  userId: z.string(),
});

export const listTasksTool = ai.defineTool(
  {
    name: 'listTasks',
    description: "List all of the user's tasks.",
    inputSchema: ToolInputWithUserId,
    outputSchema: z.any(),
  },
  async ({ userId }) => {
    return await getTasksForUser(userId);
  }
);

export const getTaskTool = ai.defineTool(
    {
        name: 'getTask',
        description: "Get the details of a single task by its ID or title. Use this to get context before answering questions about a specific task.",
        inputSchema: ToolInputWithUserId.extend({
            taskId: z.string().optional().describe("The ID of the task to retrieve."),
            taskTitle: z.string().optional().describe("The title of the task to retrieve. Use this if the user refers to the task by name."),
        }),
        outputSchema: z.any(),
    },
    async ({ userId, taskId, taskTitle }) => {
        if (!taskId && !taskTitle) {
            throw new Error("Either taskId or taskTitle must be provided.");
        }
        return await getTaskByIdOrTitle(userId, { id: taskId, title: taskTitle });
    }
);

export const addTaskTool = ai.defineTool(
    {
      name: 'addTask',
      description: 'Add a new task to the user\'s to-do list. Use the AI parser to extract details from a natural language description of the task.',
      inputSchema: ToolInputWithUserId.extend({
          taskDescription: z.string().describe("The user's natural language description of the task to be added. e.g., 'buy milk tomorrow at 5pm, it is high priority'"),
      }),
      outputSchema: z.any(),
    },
    async ({ userId, taskDescription }) => {
        const parsedTask = await parseTask({ taskInput: taskDescription });
        return await addTaskForUser(userId, parsedTask);
    }
);

export const updateTaskTool = ai.defineTool(
    {
        name: 'updateTask',
        description: 'Update an existing task. Use this to mark tasks as complete.',
        inputSchema: ToolInputWithUserId.extend({
            taskId: z.string().describe("The ID of the task to update."),
            updates: z.object({
                title: z.string().optional(),
                description: z.string().optional(),
                status: z.enum(['pending', 'completed']).optional(),
            }).describe("The fields to update on the task."),
        }),
        outputSchema: z.void(),
    },
    async ({ userId, taskId, updates }) => {
        const tasks = await getTasksForUser(userId);
        if (!tasks.find(t => t.id === taskId)) {
            throw new Error("Permission denied: User does not own this task.");
        }
        
        const updatePayload: any = { ...updates };
        if (updates.status === 'completed') {
            updatePayload.completed_at = new Date().toISOString();
        }

        await updateTaskForUser(taskId, updatePayload);
    }
);

export const deleteTaskTool = ai.defineTool(
    {
        name: 'deleteTask',
        description: 'Permanently delete a task.',
        inputSchema: ToolInputWithUserId.extend({
            taskId: z.string().describe("The ID of the task to delete."),
        }),
        outputSchema: z.void(),
    },
    async ({ userId, taskId }) => {
        const tasks = await getTasksForUser(userId);
        if (!tasks.find(t => t.id === taskId)) {
            throw new Error("Permission denied: User does not own this task.");
        }
        await deleteTaskForUser(taskId);
    }
);
