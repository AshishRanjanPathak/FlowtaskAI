'use server';
/**
 * @fileOverview An AI agent that parses tasks from voice or text input into a structured to-do list.
 *
 * - parseTask - A function that handles the task parsing process.
 * - ParseTaskInput - The input type for the parseTask function.
 * - ParseTaskOutput - The return type for the parseTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseTaskInputSchema = z.object({
  taskInput: z
    .string()
    .describe('The task input from voice or text.'),
});
export type ParseTaskInput = z.infer<typeof ParseTaskInputSchema>;

const ParseTaskOutputSchema = z.object({
  title: z.string().describe('The title of the task.'),
  description: z.string().optional().describe('A more detailed description of the task.'),
  dueDate: z.string().optional().describe('The due date of the task, in ISO format.'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium')
    .describe('The priority of the task.'),
  energyLevel:
    z.number().int().min(1).max(5).default(3).describe('The estimated energy level required for the task (1-5).'),
});
export type ParseTaskOutput = z.infer<typeof ParseTaskOutputSchema>;

export async function parseTask(input: ParseTaskInput): Promise<ParseTaskOutput> {
  return parseTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseTaskPrompt',
  input: {schema: ParseTaskInputSchema},
  output: {schema: ParseTaskOutputSchema},
  prompt: `You are a task parsing AI. Take the user's input and extract the following fields.

  - title: The title of the task. Required.
  - description: A more detailed description of the task, if available.
  - dueDate: The due date of the task, if available. Must be in ISO format.
  - priority: The priority of the task. Can be one of 'low', 'medium', 'high', or 'urgent'. Defaults to 'medium'.
  - energyLevel: The estimated energy level required for the task, on a scale of 1-5. Defaults to 3.

  Task Input: {{{taskInput}}}
  Output the extracted fields in JSON format.
  `,
});

const parseTaskFlow = ai.defineFlow(
  {
    name: 'parseTaskFlow',
    inputSchema: ParseTaskInputSchema,
    outputSchema: ParseTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
