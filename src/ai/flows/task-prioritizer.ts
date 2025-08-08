'use server';

/**
 * @fileOverview AI-powered task prioritization flow.
 *
 * - prioritizeTasks - A function that prioritizes tasks based on urgency, energy level, and mood.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The return type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  title: z.string().describe('The title of the task.'),
  description: z.string().optional().describe('A more detailed description of the task.'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium').describe('The priority of the task (low, medium, high, urgent).'),
  energyLevel: z.number().min(1).max(5).default(3).describe('The energy level required to complete the task (1-5, 1 being low energy, 5 being high energy).'),
  dueDate: z.string().optional().describe('The due date of the task in ISO format.'),
});

const PrioritizeTasksInputSchema = z.object({
  tasks: z.array(TaskSchema).describe('The list of tasks to prioritize.'),
  mood: z.string().optional().describe('The current mood of the user.'),
  energyLevel: z.number().min(1).max(5).optional().describe('The current energy level of the user (1-5, 1 being low energy, 5 being high energy).'),
});
export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizedTaskSchema = TaskSchema.extend({
  reasoning: z.string().describe('The AI reasoning for the task prioritization.'),
  adjustedPriority: z.enum(['low', 'medium', 'high', 'urgent']).describe('The adjusted priority of the task based on the AI reasoning.'),
});

const PrioritizeTasksOutputSchema = z.array(PrioritizedTaskSchema);
export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are a personal task management assistant. Given the following list of tasks, 
prioritize them based on urgency, the energy level required to complete them, and the user's current mood and energy level.

Tasks:
{{#each tasks}}
- Title: {{this.title}}
  Description: {{this.description}}
  Priority: {{this.priority}}
  Energy Level: {{this.energyLevel}}
  Due Date: {{this.dueDate}}
{{/each}}

Current Mood: {{mood}}
Current Energy Level: {{energyLevel}}

For each task, provide a brief reasoning for its prioritization and assign an adjusted priority (low, medium, high, urgent).
Return the list of tasks with the added reasoning and adjustedPriority fields.

Output format: An array of JSON objects, each containing the original task details, a "reasoning" field, and an "adjustedPriority" field.

Example:
[
  {
    "id": "task1",
    "title": "Grocery Shopping",
    "description": "Buy groceries for the week",
    "priority": "medium",
    "energyLevel": 2,
    "dueDate": "2024-08-08T18:00:00.000Z",
    "reasoning": "Due soon and requires low energy, so it's a good task to do now.",
    "adjustedPriority": "high"
  },
  ...
]
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
